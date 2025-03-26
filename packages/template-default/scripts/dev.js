import { sync } from '@jx-cli/sync'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.join(__dirname, '..')
const remoteSiteUrl = process.env.REMOTE_SITE_URL
if (!remoteSiteUrl) {
  console.log('请配置站点地址')
  return
}
await sync({
  srcDir: path.join(projectRoot, 'src'),
  remoteSiteUrl
})
