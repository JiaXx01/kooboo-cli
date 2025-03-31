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
  remoteSiteUrl: string
  token: string
  codeInitial: boolean
  strict: boolean
}

export async function sync(options: SyncOptions) {
  const { srcDir, remoteSiteUrl, token, codeInitial = false } = options
  axios.defaults.baseURL = remoteSiteUrl
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  // 初始化 watcher
  const watcher = chokidar.watch(srcDir, {
    ignored: /(^|[\/\\])\../, // 忽略隐藏文件
    persistent: true,
    ignoreInitial: !codeInitial
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
          execSyncSaveTo(relativePath, code)
        } catch (error) {
          console.log(`同步失败: 语法错误`)
        }
      } else if ('.html' === ext) {
        // 将html文件中<view id="aa/bb/cc"></view>的id值进行转换，转换规则为：
        // 将/替换为. 比如aa/bb/cc转换为aa.bb.cc、 aa则为aa
        const code = source.replace(/<view id="([^"]+)"><\/view>/g, (_, p1) => {
          return `<view id="${p1
            .replace(/\./g, '/')
            .replace(/\//g, '.')}"></view>`
        })
        execSyncSaveTo(relativePath, code)
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
