import 'dotenv/config'
import { syncPush } from '@kooboo_cli/sync'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.join(__dirname, '..')
const remoteSiteUrl = process.env.REMOTE_SITE_URL
const token = process.env.BASIC_AUTH_TOKEN

// 检查是否有 --init 参数
const codeInitial = process.argv.includes('--init')

if (!remoteSiteUrl || !token) {
  console.log('请配置站点地址和 token')
} else {
  await syncPush({
    srcDir: path.join(projectRoot, 'src'),
    remoteSiteUrl,
    token,
    codeInitial
  })
}
