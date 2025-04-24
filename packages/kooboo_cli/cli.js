#!/usr/bin/env node

// 这个文件是 kooboo_cli 全局包的入口点
// 它只是简单地将所有命令转发到 @kooboo_cli/cli 包

try {
  // 尝试导入并执行 @kooboo_cli/cli 包
  import('@kooboo_cli/cli/dist/index.js').catch(err => {
    console.error('Error loading @kooboo_cli/cli package:')
    console.error(err)
    process.exit(1)
  })
} catch (err) {
  // 退回到 require 方式 (对于 CommonJS 环境)
  try {
    require('@kooboo_cli/cli/dist/index.js')
  } catch (requireErr) {
    console.error('Failed to load @kooboo_cli/cli package:')
    console.error(err)
    console.error('Please make sure @kooboo_cli/cli is installed correctly.')
    process.exit(1)
  }
}
