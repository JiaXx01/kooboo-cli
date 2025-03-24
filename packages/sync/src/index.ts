import chokidar from 'chokidar'
import { transform } from '@babel/core'
import fs from 'node:fs'
import path from 'node:path'

interface SyncOptions {
  srcDir: string
  outDir: string
  presets?: string[]
}

// 默认的 babel 配置
const defaultPresets = [
  ['@babel/preset-env', { targets: { node: 'current' } }],
  '@babel/preset-react',
  '@babel/preset-typescript'
]

export async function sync(options: SyncOptions) {
  const { srcDir, outDir: outputDir, presets = defaultPresets } = options

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

      // 使用 babel 转换
      const result = await transform(source, {
        presets,
        filename: filePath
      })

      if (result?.code) {
        // 写入转换后的文件
        fs.writeFileSync(outPath, result.code)
        console.log(`Transformed: ${relativePath}`)
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
