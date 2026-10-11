const express = require('express')
const multer = require('multer')
const nodemailer = require('nodemailer')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const { exec } = require('child_process')

const app = express()
const port = process.env.PORT || 3000
const root = __dirname
const dataPath = path.join(root, 'data', 'dynamic-content.json')
const uploadPath = path.join(root, 'public', 'uploads')
const backupPath = path.join(root, 'data', 'backups')
const smtpPath = path.join(root, 'data', 'smtp-config.json')
fs.mkdirSync(path.dirname(dataPath), { recursive: true })
fs.mkdirSync(uploadPath, { recursive: true })
fs.mkdirSync(backupPath, { recursive: true })

const storage = multer.diskStorage({
  destination: (_, __, callback) => callback(null, uploadPath),
  filename: (_, file, callback) => callback(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '-')}`),
})
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_, file, callback) => callback(null, /\.(pdf|jpg|jpeg|png|webp)$/i.test(file.originalname)),
})

app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(root, 'public')))

function readContent() {
  return JSON.parse(fs.readFileSync(dataPath, 'utf8'))
}
function contentRev() {
  try {
    return crypto.createHash('sha1').update(fs.readFileSync(dataPath)).digest('hex').slice(0, 12)
  } catch {
    return ''
  }
}
function backupContent() {
  if (!fs.existsSync(dataPath)) return
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  fs.copyFileSync(dataPath, path.join(backupPath, `dynamic-content-${stamp}.json`))
  const files = fs.readdirSync(backupPath).filter((f) => f.endsWith('.json')).sort()
  while (files.length > 20) fs.unlinkSync(path.join(backupPath, files.shift()))
}
function writeContent(content) {
  backupContent()
  fs.writeFileSync(dataPath, `${JSON.stringify(content, null, 2)}\n`)
}
function git(args) {
  return new Promise((resolve) => {
    exec(`git ${args}`, { cwd: root }, (error, stdout, stderr) =>
      resolve({ ok: !error, stdout: (stdout || '').trim(), stderr: (stderr || '').trim(), message: error ? error.message : '' }),
    )
  })
}
async function currentBranch() {
  const branch = await git('rev-parse --abbrev-ref HEAD')
  return branch.stdout && branch.stdout !== 'HEAD' ? branch.stdout : 'main'
}
async function gitStatus() {
  const inside = await git('rev-parse --is-inside-work-tree')
  const status = { isRepo: inside.ok, remote: '', branch: 'main', ahead: 0, behind: 0, lastCommit: '', hasChanges: false }
  if (!inside.ok) return status
  status.branch = await currentBranch()
  status.remote = (await git('remote get-url origin')).stdout
  status.lastCommit = (await git('log -1 --pretty=%s')).stdout
  status.hasChanges = !!(await git('status --porcelain')).stdout
  const counts = (await git(`rev-list --left-right --count ${status.branch}...origin/${status.branch}`)).stdout
  if (counts) {
    const [ahead, behind] = counts.split(/\s+/).map(Number)
    status.ahead = ahead || 0
    status.behind = behind || 0
  }
  return status
}
async function gitDeploy(message) {
  const inside = await git('rev-parse --is-inside-work-tree')
  if (!inside.ok) return { ok: false, skipped: true, message: 'Not a git repository — saved locally only.' }
  const branch = await currentBranch()
  await git('add -A')
  const commit = await git(`commit -m ${JSON.stringify(message)}`)
  if (!commit.ok && !/nothing to commit/i.test(`${commit.stdout} ${commit.stderr}`)) {
    return { ok: false, skipped: true, message: commit.message || commit.stderr }
  }
  const push = await git(`push -u origin ${branch}`)
  if (!push.ok) return { ok: false, skipped: true, message: 'Committed locally, but push failed (check remote/credentials).', detail: push.stderr }
  return { ok: true, message: `Committed and pushed to origin/${branch}.` }
}
const validRepoUrl = (url) => /^(https:\/\/github\.com\/[^\s]+|git@github\.com:[^\s]+)$/i.test(url)
async function gitSetup(url, branch) {
  const inside = await git('rev-parse --is-inside-work-tree')
  if (!inside.ok) {
    const init = await git('init')
    if (!init.ok) return { ok: false, error: init.message || 'Could not initialize git.' }
  }
  if (url) {
    const current = await git('remote get-url origin')
    const setRemote = current.ok ? await git(`remote set-url origin ${JSON.stringify(url)}`) : await git(`remote add origin ${JSON.stringify(url)}`)
    if (!setRemote.ok) return { ok: false, error: setRemote.message || 'Could not configure remote.' }
  }
  await git(`branch -M ${branch}`)
  await git(`branch --set-upstream-to=origin/${branch} ${branch}`)
  return { ok: true, message: 'GitHub repository configured.', status: await gitStatus() }
}

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim())
const escHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
function readSmtp() {
  try {
    return JSON.parse(fs.readFileSync(smtpPath, 'utf8'))
  } catch {
    return {}
  }
}
function writeSmtp(config) {
  fs.writeFileSync(smtpPath, `${JSON.stringify(config, null, 2)}\n`)
}
function publicSmtp(config) {
  const { pass, ...rest } = config || {}
  return { ...rest, hasPassword: !!pass }
}
function makeTransport(config) {
  return nodemailer.createTransport({
    host: config.host,
    port: Number(config.port) || 587,
    secure: !!config.secure,
    auth: config.user ? { user: config.user, pass: config.pass } : undefined,
  })
}
function mailFrom(config) {
  return config.fromEmail ? `"${config.fromName || 'Website enquiry'}" <${config.fromEmail}>` : config.user || `no-reply@${config.host}`
}
function sendMail(config, { to, subject, text, html, replyTo }) {
  return makeTransport(config).sendMail({ from: mailFrom(config), to, subject, text, html, replyTo })
}
const contactHits = new Map()
function contactRateLimit(request, response, next) {
  const ip = String(request.headers['x-forwarded-for'] || request.ip || 'local').split(',')[0].trim()
  const now = Date.now()
  const windowMs = 10 * 60 * 1000
  const recent = (contactHits.get(ip) || []).filter((t) => now - t < windowMs)
  if (recent.length >= 5) return response.status(429).json({ ok: false, error: 'Too many messages sent. Please try again in a little while.' })
  recent.push(now)
  contactHits.set(ip, recent)
  next()
}

app.get('/api/health', (_, response) => response.json({ ok: true, time: new Date().toISOString() }))
app.get('/api/content', (_, response) => response.set('X-Content-Rev', contentRev()).json(readContent()))
app.post('/api/content', async (request, response) => {
  try {
    const clientRev = request.get('X-Content-Rev')
    if (!clientRev || clientRev !== contentRev()) {
      return response.status(409).set('X-Content-Rev', contentRev()).json({ ok: false, conflict: true, error: 'Content changed elsewhere (or a stale tab). Reload before saving.', content: readContent() })
    }
    writeContent(request.body)
    const deploy = request.body.gitDeploy === false ? { ok: true, skipped: true, message: 'Saved locally (deploy skipped).' } : await gitDeploy('Update NBA content via local CMS')
    response.set('X-Content-Rev', contentRev()).json({ ok: true, content: readContent(), git: deploy })
  } catch (error) {
    response.status(400).json({ ok: false, error: error.message })
  }
})
app.get('/api/git', async (_, response) => response.json({ ok: true, status: await gitStatus() }))
app.post('/api/git/setup', async (request, response) => {
  const url = String((request.body && request.body.url) || '').trim()
  const branch = String((request.body && request.body.branch) || 'main').trim() || 'main'
  if (url && !validRepoUrl(url)) {
    return response.status(400).json({ ok: false, error: 'Enter a valid GitHub repository URL, e.g. https://github.com/owner/repo.git' })
  }
  try {
    const result = await gitSetup(url, branch)
    response.status(result.ok ? 200 : 400).json(result)
  } catch (error) {
    response.status(400).json({ ok: false, error: error.message })
  }
})
app.post('/api/git/push', async (_, response) => {
  const deploy = await gitDeploy('Update content via local CMS')
  response.status(deploy.ok ? 200 : 400).json(deploy)
})
app.get('/api/backups', (_, response) => {
  const files = fs.readdirSync(backupPath).filter((f) => f.endsWith('.json')).sort().reverse()
  response.json({ ok: true, backups: files.slice(0, 20) })
})
app.post('/api/restore', (request, response) => {
  const name = path.basename(String(request.body && request.body.file || ''))
  const file = path.join(backupPath, name)
  if (!name || !fs.existsSync(file)) return response.status(404).json({ ok: false, error: 'Backup not found.' })
  try {
    const content = JSON.parse(fs.readFileSync(file, 'utf8'))
    writeContent(content)
    response.json({ ok: true, content: readContent() })
  } catch (error) {
    response.status(400).json({ ok: false, error: error.message })
  }
})
app.post('/api/upload', upload.single('file'), (request, response) => {
  if (!request.file) return response.status(400).json({ ok: false, error: 'Only PDF, JPG, PNG, and WEBP files are supported.' })
  response.json({ ok: true, url: `/uploads/${request.file.filename}`, filename: request.file.filename })
})
app.get('/api/smtp', (_, response) => response.json({ ok: true, config: publicSmtp(readSmtp()) }))
app.post('/api/smtp', (request, response) => {
  try {
    const body = request.body || {}
    const existing = readSmtp()
    const recipients = Array.isArray(body.recipients)
      ? [...new Set(body.recipients.map((value) => String(value).trim()).filter(isEmail))]
      : []
    const pass = body.pass === undefined || body.pass === '' ? existing.pass || '' : String(body.pass)
    const config = {
      host: String(body.host || '').trim(),
      port: Number(body.port) || 587,
      secure: !!body.secure,
      user: String(body.user || '').trim(),
      pass,
      fromName: String(body.fromName || '').trim(),
      fromEmail: String(body.fromEmail || '').trim(),
      recipients,
    }
    writeSmtp(config)
    response.json({ ok: true, config: publicSmtp(config) })
  } catch (error) {
    response.status(400).json({ ok: false, error: error.message })
  }
})
app.post('/api/smtp/test', async (request, response) => {
  const config = readSmtp()
  const to = String((request.body && request.body.to) || '').trim() || (config.recipients || [])[0]
  if (!config.host) return response.status(400).json({ ok: false, error: 'Save your SMTP settings first.' })
  if (!isEmail(to)) return response.status(400).json({ ok: false, error: 'Enter a valid recipient email to test with.' })
  try {
    await sendMail(config, {
      to,
      subject: 'Nakshatra contact form — test email',
      text: 'This is a test email from your Nakshatra admin panel. If you received it, your contact form is ready to deliver enquiries.',
      html: '<p>This is a test email from your <strong>Nakshatra</strong> admin panel.</p><p>If you received it, your contact form is ready to deliver enquiries.</p>',
    })
    response.json({ ok: true, message: `Test email sent to ${to}.` })
  } catch (error) {
    response.status(500).json({ ok: false, error: error.message || 'Could not send the test email.' })
  }
})
app.post('/api/contact', contactRateLimit, async (request, response) => {
  const body = request.body || {}
  const name = String(body.name || '').trim().slice(0, 200)
  const email = String(body.email || '').trim().slice(0, 200)
  const phone = String(body.phone || '').trim().slice(0, 60)
  const message = String(body.message || '').trim().slice(0, 5000)
  if (!name || !email || !message) return response.status(400).json({ ok: false, error: 'Please fill in your name, email, and message.' })
  if (!isEmail(email)) return response.status(400).json({ ok: false, error: 'Please enter a valid email address.' })
  const config = readSmtp()
  if (!config.host || !(config.recipients || []).length) {
    return response.status(503).json({ ok: false, error: 'The contact form is not set up yet. Please email us directly.' })
  }
  try {
    await sendMail(config, {
      to: config.recipients.join(', '),
      replyTo: email,
      subject: `New enquiry from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || '—'}\n\n${message}`,
      html: `<h2 style="margin:0 0 12px">New enquiry</h2>
<p style="margin:4px 0"><strong>Name:</strong> ${escHtml(name)}</p>
<p style="margin:4px 0"><strong>Email:</strong> ${escHtml(email)}</p>
<p style="margin:4px 0"><strong>Phone:</strong> ${escHtml(phone || '—')}</p>
<p style="margin:16px 0 4px"><strong>Message:</strong></p>
<p style="white-space:pre-wrap;margin:0">${escHtml(message)}</p>`,
    })
    response.json({ ok: true })
  } catch (error) {
    response.status(500).json({ ok: false, error: 'Could not send your message right now. Please try again later.', detail: error.message })
  }
})
app.get('/admin', (_, response) => response.sendFile(path.join(root, 'public', 'admin.html')))
app.listen(port, () => console.log(`NBA CMS running at http://localhost:${port}`))
