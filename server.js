const express = require('express')
const multer = require('multer')
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
async function gitDeploy(message) {
  const inside = await git('rev-parse --is-inside-work-tree')
  if (!inside.ok) return { ok: false, skipped: true, message: 'Not a git repository — saved locally only.' }
  await git('add -A')
  const commit = await git(`commit -m ${JSON.stringify(message)}`)
  if (!commit.ok && !/nothing to commit/i.test(`${commit.stdout} ${commit.stderr}`)) {
    return { ok: false, skipped: true, message: commit.message || commit.stderr }
  }
  const push = await git('push origin main')
  if (!push.ok) return { ok: false, skipped: true, message: 'Committed locally, but push failed (check remote/credentials).', detail: push.stderr }
  return { ok: true, message: 'Committed and pushed to origin/main.' }
}

app.get('/api/health', (_, response) => response.json({ ok: true, time: new Date().toISOString() }))
app.get('/api/content', (_, response) => response.set('X-Content-Rev', contentRev()).json(readContent()))
app.post('/api/content', async (request, response) => {
  try {
    const clientRev = request.get('X-Content-Rev')
    if (!clientRev || clientRev !== contentRev()) {
      return response.status(409).json({ ok: false, conflict: true, error: 'Content changed elsewhere (or a stale tab). Reload before saving.', content: readContent() })
    }
    writeContent(request.body)
    const deploy = request.body.gitDeploy === false ? { ok: true, skipped: true, message: 'Saved locally (deploy skipped).' } : await gitDeploy('Update NBA content via local CMS')
    response.set('X-Content-Rev', contentRev()).json({ ok: true, content: readContent(), git: deploy })
  } catch (error) {
    response.status(400).json({ ok: false, error: error.message })
  }
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
app.get('/admin', (_, response) => response.sendFile(path.join(root, 'public', 'admin.html')))
app.listen(port, () => console.log(`NBA CMS running at http://localhost:${port}`))
