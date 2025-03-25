import chokidar from 'chokidar'
import { transform } from '@babel/core'
import fs from 'node:fs'
import path from 'node:path'
import importCodeBlockTransformer from './babel-plugins/import-transformer.mjs'

interface SyncOptions {
  srcDir: string
  outDir: string
}

export async function sync(options: SyncOptions) {
  const { srcDir, outDir: outputDir } = options

  // 确保输出目录存在
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // 初始化 watcher
  const watcher = chokidar.watch(srcDir, {
    ignored: /(^|[\/\\])\../, // 忽略隐藏文件
    persistent: true
  })

  // 处理文件变化
  watcher
    .on('add', handleFileChange)
    .on('change', handleFileChange)
    .on('unlink', handleFileDelete)

  async function handleFileChange(filePath: string) {
    try {
      const relativePath = path.relative(srcDir, filePath)
      const outPath = path.join(outputDir, relativePath)

      // 确保输出文件的目录存在
      const outDir = path.dirname(outPath)
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true })
      }

      // 读取源文件
      const source = fs.readFileSync(filePath, 'utf-8')

      // 只对 .ts, .tsx, .js, .jsx 文件进行导入语句转换
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

        if (result?.code) {
          // 写入转换后的文件
          fs.writeFileSync(outPath, result.code)
          console.log(`Transformed imports: ${relativePath}`)
        }
      } else {
        // 对于其他类型的文件，直接复制
        fs.copyFileSync(filePath, outPath)
        console.log(`Copied: ${relativePath}`)
      }
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error)
    }
  }

  function handleFileDelete(filePath: string) {
    try {
      const relativePath = path.relative(srcDir, filePath)
      const outPath = path.join(outputDir, relativePath)

      if (fs.existsSync(outPath)) {
        fs.unlinkSync(outPath)
        console.log(`Deleted: ${relativePath}`)
      }
    } catch (error) {
      console.error(`Error deleting ${filePath}:`, error)
    }
  }

  // 返回一个清理函数
  return () => {
    watcher.close()
  }
}
