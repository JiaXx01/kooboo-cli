import { sync } from '@jx-cli/sync'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.join(__dirname, '..')

await sync({
  srcDir: path.join(projectRoot, 'src'),
  outDir: path.join(projectRoot, 'dist')
})
