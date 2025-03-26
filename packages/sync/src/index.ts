import chokidar from 'chokidar'
import { transform } from '@babel/core'
import fs from 'node:fs'
import path from 'node:path'
import importCodeBlockTransformer from './babel-plugins/import-transformer.mjs'
import { execSyncDeleteTo, execSyncSaveTo } from './sync/index.js'

import axios from 'axios'

export const syncRequest = (data: any) =>
  axios.post('/_site_import_helper/api/__import', data)

interface SyncOptions {
  srcDir: string
  serverUrl: string
}

export async function sync(options: SyncOptions) {
  const { srcDir, serverUrl } = options
  axios.defaults.baseURL = serverUrl
  // 初始化 watcher
  const watcher = chokidar.watch(srcDir, {
    ignored: /(^|[\/\\])\../, // 忽略隐藏文件
    persistent: true,
    ignoreInitial: true
  })

  // 处理文件变化 - 只在文件真正变动时执行，初次运行时不执行
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

      // 只对 .ts, .js  文件进行导入语句转换
      const ext = path.extname(filePath)
      if (['.ts', '.js'].includes(ext)) {
        // 只处理导入语句转换，不进行其他转换
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

        // if (result?.code) {
        const code = result?.code || ''
        execSyncSaveTo(relativePath, code)
        // }
      } else {
        execSyncSaveTo(relativePath, source)
      }
    } catch (error) {
      console.error(`Error processing ${filePath}:`)
    }
  }

  function handleFileDelete(filePath: string) {
    try {
      const relativePath = path.relative(srcDir, filePath)

      execSyncDeleteTo(relativePath)
    } catch (error) {
      console.error(`Error deleting ${filePath}:`, error)
    }
  }

  // 返回一个清理函数
  return () => {
    watcher.close()
  }
}
