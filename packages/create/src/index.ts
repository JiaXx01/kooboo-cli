import {
  select,
  input,
  confirm,
  password as passwordInput
} from '@inquirer/prompts'
import os from 'node:os'
import { NpmPackage } from '@jx-cli/utils'
import path from 'node:path'
import ora from 'ora'
import fse from 'fs-extra'
import ejs from 'ejs'
import { glob } from 'glob'
import { checkAuth } from './checkAuth.js'
import { createKoobooSite } from './createSite.js'
interface AuthData {
  token: string
  expireAt: number
  serverUrl: string
  username: string
  password: string
}

async function create() {
  let authSuccess = false
  let authData: AuthData | null = null

  while (!authSuccess) {
    let username = ''
    while (!username) {
      username = await input({ message: '请输入用户名' })
    }

    let password = ''
    while (!password) {
      password = await passwordInput({
        message: '请输入密码'
      })
    }

    const auth_spinner = ora('验证身份中...').start()
    const result = await checkAuth(username, password)
    auth_spinner.stop()

    if (!result.success) {
      auth_spinner.fail('验证身份失败，请重新输入用户名和密码')
    } else {
      auth_spinner.succeed('验证身份成功！')
      authSuccess = true
      authData = {
        ...result.data!,
        username,
        password
      }
    }
  }

  let projectName = ''
  while (!projectName) {
    projectName = await input({ message: '请输入项目名' })
  }
  const createSiteSpinner = ora('创建远程站点中...').start()
  const createSiteResult = await createKoobooSite({
    siteName: projectName,
    token: authData?.token!,
    serverUrl: authData?.serverUrl!
  })
  createSiteSpinner.stop()

  if (!createSiteResult.success) {
    ora('创建站点失败, 请检查信息后重试').fail()
    return
  }

  const projectTemplate = await select({
    message: '请选择项目模版',
    choices: [
      {
        name: '基础模板',
        value: '@jx-cli/template-default'
      }
    ]
  })

  const targetPath = path.join(process.cwd(), projectName)

  if (fse.existsSync(targetPath)) {
    const empty = await confirm({ message: '该目录不为空，是否清空' })
    if (empty) {
      fse.emptyDirSync(targetPath)
    } else {
      process.exit(0)
    }
  }

  const pkg = new NpmPackage({
    name: projectTemplate,
    targetPath: path.join(os.homedir(), '.jx-cli-template')
  })

  if (!(await pkg.exists())) {
    const spinner = ora('下载模版中...').start()
    await pkg.install()
    spinner.stop()
  } else {
    const spinner = ora('更新模版中...').start()
    await pkg.update()
    spinner.stop()
  }

  const spinner = ora('创建项目中...').start()

  const templatePath = pkg.npmFilePath

  fse.copySync(templatePath, targetPath)

  const files = await glob('**', {
    cwd: targetPath,
    nodir: true,
    ignore: ['node_modules/**', 'src/**'],
    dot: true // 添加dot选项以匹配以点开头的文件，如.env
  })
  for (let i = 0; i < files.length; i++) {
    const filePath = path.join(targetPath, files[i])
    const renderResult = await ejs.renderFile(filePath, {
      SERVER_URL: authData?.serverUrl,
      REMOTE_SITE_URL: createSiteResult.data.siteUrl,
      REMOTE_SITE_ID: createSiteResult.data.siteId,
      BASIC_AUTH_USER_NAME: authData?.username,
      BASIC_AUTH_PASSWORD: authData?.password,
      BASIC_AUTH_TOKEN: authData?.token,
      BASIC_AUTH_EXPIRE_AT: authData?.expireAt
    })
    fse.writeFileSync(filePath, renderResult)
  }
  fse.removeSync(path.join(targetPath, 'CHANGELOG.md'))

  spinner.stop()
}

export default create
