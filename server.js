const express = require('express')
const multer = require('multer')
const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')

const app = express()
const port = process.env.PORT || 3000
const root = __dirname
const dataPath = path.join(root, 'data', 'dynamic-content.json')
const uploadPath = path.join(root, 'public', 'uploads')
fs.mkdirSync(path.dirname(dataPath), { recursive: true })
fs.mkdirSync(uploadPath, { recursive: true })

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
function writeContent(content) {
  fs.writeFileSync(dataPath, `${JSON.stringify(content, null, 2)}\n`)
}
function gitDeploy(message) {
  return new Promise((resolve) => {
    exec(`git add . && git commit -m ${JSON.stringify(message)} && git push origin main`, { cwd: root }, (error, stdout, stderr) => {
      resolve({ ok: !error, stdout, stderr: error ? error.message : '' })
    })
  })
}

app.get('/api/content', (_, response) => response.json(readContent()))
app.post('/api/content', async (request, response) => {
  try {
    writeContent(request.body)
    const git = request.body.gitDeploy === false ? { ok: true, skipped: true } : await gitDeploy('Update NBA content via local CMS')
    response.json({ ok: true, content: readContent(), git })
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
