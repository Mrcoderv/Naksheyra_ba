import { promises as fs } from 'fs'
import path from 'path'

export async function getContent(): Promise<any> {
  const file = path.join(process.cwd(), 'data', 'dynamic-content.json')
  const raw = await fs.readFile(file, 'utf8')
  return JSON.parse(raw)
}
