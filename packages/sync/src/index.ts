import chokidar from 'chokidar'
import { transform } from '@babel/core'
import fs from 'node:fs'
import path from 'node:path'
import importCodeBlockTransformer from './babel-plugins/import-transformer.mjs'
import { execDelete, execPush } from './sync/push.js'
import { setSyncRequest, getTypeAndNameByLocalPath } from './utils.js'

import axios from 'axios'

axios.interceptors.response.use(
  response => {
    return response
  },
  error => {
    console.log(error.response.data)
    console.log(error.response.status)
    console.log(error.response.headers)
  }
)

export const syncRequest = (data: any) =>
  axios.post('/_site_import_helper/api/__import', data)

interface SyncOptions {
  srcDir: string
  remoteSiteUrl: string
  token: string
  codeInitial: boolean
  strict: boolean
}

export async function syncPush(options: SyncOptions) {
  const { srcDir, remoteSiteUrl, token, codeInitial = false } = options
  setSyncRequest({
    remoteSiteUrl,
    token
  })
  // 监听的文件类型
  const WATCH_CODE_DIRS = [
    'Api',
    'CodeBlock',
    'Script',
    'Style',
    'Layout',
    'Page',
    'View'
  ]
  const watcher = chokidar.watch(
    WATCH_CODE_DIRS.map(dir => path.join(srcDir, dir, '**/*')),
    {
      ignored: /(^|[\/\\])\../, // 忽略隐藏文件
      persistent: true,
      ignoreInitial: !codeInitial
    }
  )

  // 处理文件变化
  watcher
    .on('ready', () => {
      console.log('开始监听文件变动')
    })
    .on('add', handleFileChange)
    .on('change', handleFileChange)
    .on('unlink', handleFileDelete)

  async function handleFileChange(filePath: string) {
    try {
      const relativePath = path.relative(srcDir, filePath)

      // 读取源文件
      const source = fs.readFileSync(filePath, 'utf-8')
      const { type, name } = getTypeAndNameByLocalPath(relativePath)
      // 只对 .ts, .js  文件进行导入语句转换
      const ext = path.extname(relativePath)
      if (
        (type === 'codeblock' || type === 'api') &&
        ['.ts', '.js'].includes(ext)
      ) {
        // 只处理导入语句转换，不进行其他转换
        try {
          const result = transform(source, {
            sourceType: 'module',
            parserOpts: {
              plugins: ['typescript'] // 让 babel 能够解析 TS 语法
            },
            plugins: [importCodeBlockTransformer],
            filename: filePath,
            // 关闭代码生成，只进行 AST 转换
            generatorOpts: {
              retainLines: true, // 保持原始行号
              compact: false, // 不压缩代码
              comments: true // 保留注释
            }
          })

          const code = result?.code || ''
          execPush(relativePath, code)
        } catch (error) {
          console.log(`同步失败: 语法错误`)
        }
      } else if (ext === '.html') {
        // 将html文件中<view id="aa/bb/cc"></view>的id值进行转换，转换规则为：
        // 将/替换为. 比如aa/bb/cc转换为aa.bb.cc、 aa则为aa
        const code = source.replace(/<view id="([^"]+)"><\/view>/g, (_, p1) => {
          return `<view id="${p1
            .replace(/\./g, '/')
            .replace(/\//g, '.')}"></view>`
        })
        execPush(relativePath, code)
      } else {
        execPush(relativePath, source)
      }
    } catch (error) {
      console.error(`Error processing ${filePath}:`)
    }
  }

  function handleFileDelete(filePath: string) {
    try {
      const relativePath = path.relative(srcDir, filePath)

      execDelete(relativePath)
    } catch (error) {
      console.error(`Error deleting ${filePath}:`, error)
    }
  }

  // 返回一个清理函数
  return () => {
    watcher.close()
  }
}

export async function syncPull() {}
