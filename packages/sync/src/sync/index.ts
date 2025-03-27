import axios from 'axios'
import { syncRequest } from '../index.js'

/**
 * 同步代码到指定代码类型
 * @param path 本地文件路径
 * @param code 代码内容
 */
export function execSyncSaveTo(
  path: string,
  code: string,
  isDev: boolean = false
) {
  // 同步到 api 目录
  if (path.startsWith('Api')) {
    // 检查路径格式是否为 Api/xx.ts
    const apiPathRegex = /^Api\/(.+)\.ts$/
    const match = path.match(apiPathRegex)
    if (match) {
      const apiName = match[1] // 提取 Api/ 后面的部分（不含扩展名）
      // 将 Api/xx.ts 转换为 api/xx/{params} 格式
      const apiEndpoint = `api/${apiName}/{params}`
      // 这里可以添加实际的同步逻辑
      syncRequest({
        codeArr: [
          {
            type: 'api',
            resource: {
              name: apiName,
              body: code,
              url: apiEndpoint
            }
          }
        ]
      })
        .then(res => {
          console.log(`同步成功: ${path} -> ${apiName}`)
        })
        .catch(err => {
          console.log(`同步失败: ${path} -> ${apiName}`)
        })
    } else {
      console.log(
        `Invalid API path format: ${path}. Expected format: Api/xx.ts`
      )
    }
  } else if (path.startsWith('Page')) {
    // 检查路径格式是否为 Page/xx.html
    const pagePathRegex = /^Page\/(.+)\.html$/
    const match = path.match(pagePathRegex)
    if (match) {
      const pageName = match[1] // 提取 Page/ 后面的部分（不含扩展名）
      const pagePath = `/${pageName}`
      syncRequest({
        codeArr: [
          {
            type: 'page',
            resource: { name: pageName, body: code, url: pagePath }
          }
        ]
      })
        .then(res => {
          console.log(`同步成功: ${path} -> ${pageName}`)
        })
        .catch(err => {
          console.log(`同步失败: ${path} -> ${pageName} `)
        })
    } else {
      console.log(
        `Invalid Page path format: ${path}. Expected format: Page/xx.html`
      )
    }
  } else if (path.startsWith('CodeBlock')) {
    // 检查路径格式是否为 CodeBlock/xx.ts 或 CodeBlock/xx/yy.ts
    const codeBlockPathRegex = /^CodeBlock\/(.+)\.ts$/
    const match = path.match(codeBlockPathRegex)
    if (match) {
      const codeBlockPath = match[1] // 提取 CodeBlock/ 后面的部分（不含扩展名）
      // 将路径中的 / 替换为 .
      const formattedPath = codeBlockPath.replace(/\//g, '.')
      // 构建最终的资源路径
      const codeBlockName = `./${formattedPath}`
      console.log(`Syncing CodeBlock: ${path} -> ${codeBlockName}`)

      syncRequest({
        codeArr: [
          {
            type: 'codeblock',
            resource: {
              name: formattedPath,
              body: code
            }
          }
        ]
      })
        .then(res => {
          console.log(`同步成功: ${path} -> ${codeBlockName}`)
        })
        .catch(err => {
          console.log(`同步失败: ${path} -> ${codeBlockName} `)
        })
    } else {
      console.log(
        `Invalid CodeBlock path format: ${path}. Expected format: CodeBlock/xx.ts or CodeBlock/xx/yy.ts`
      )
    }
  } else if (path.startsWith('Layout')) {
    // 检查路径格式是否为 Layout/xx.html
    const layoutPathRegex = /^Layout\/(.+)\.html$/
    const match = path.match(layoutPathRegex)
    if (match) {
      const layoutName = match[1] // 提取 Layout/ 后面的部分（不含扩展名）
      syncRequest({
        codeArr: [
          {
            type: 'layout',
            resource: { name: layoutName, body: code }
          }
        ]
      })
        .then(res => {
          console.log(`同步成功: ${path} -> ${layoutName}`)
        })
        .catch(err => {
          console.log(`同步失败: ${path} -> ${layoutName} `)
        })
    } else {
      console.log(
        `Invalid Layout path format: ${path}. Expected format: Layout/xx.html`
      )
    }
  } else if (path.startsWith('View')) {
    // 检查路径格式是否为 View/xx.html
    const viewPathRegex = /^View\/(.+)\.html$/
    const match = path.match(viewPathRegex)
    if (match) {
      const viewName = match[1].replace(/\//g, '.') // 提取 View/ 后面的部分（不含扩展名）
      syncRequest({
        codeArr: [
          {
            type: 'view',
            resource: { name: viewName, body: code }
          }
        ]
      })
        .then(res => {
          console.log(`同步成功: ${path} -> ${viewName}`)
        })
        .catch(err => {
          console.log(`同步失败: ${path} -> ${viewName} `)
        })
    } else {
      console.log(
        `Invalid View path format: ${path}. Expected format: View/xx.html`
      )
    }
  } else if (path.startsWith('Style')) {
    // 检查路径格式是否为 Style/xx.css
    const stylePathRegex = /^Style\/(.+)\.css$/
    const match = path.match(stylePathRegex)
    if (match) {
      const styleName = match[1] + '.css' // 提取 Style/ 后面的部分（不含扩展名）
      syncRequest({
        codeArr: [
          {
            type: 'style',
            resource: { name: styleName, body: code }
          }
        ]
      })
        .then(res => {
          console.log(`同步成功: ${path} -> ${styleName}`)
        })
        .catch(err => {
          console.log(`同步失败: ${path} -> ${styleName} `)
        })
    } else {
      console.log(
        `Invalid Style path format: ${path}. Expected format: Style/xx.css`
      )
    }
  } else if (path.startsWith('Script')) {
    // 检查路径格式是否为 Script/xx.js
    const scriptPathRegex = /^Script\/(.+)\.js$/
    const match = path.match(scriptPathRegex)
    if (match) {
      const scriptName = match[1] + '.js' // 提取 Script/ 后面的部分（包含扩展名）
      syncRequest({
        codeArr: [
          {
            type: 'script',
            resource: { name: scriptName, body: code }
          }
        ]
      })
        .then(res => {
          console.log(`同步成功: ${path} -> ${scriptName}`)
        })
        .catch(err => {
          console.log(`同步失败: ${path} -> ${scriptName} `)
        })
    } else {
      console.log(
        `Invalid Script path format: ${path}. Expected format: Script/xx.js`
      )
    }
  }
}

/**
 * 同步删除指定代码类型
 * @param path 本地文件路径
 */
export function execSyncDeleteTo(path: string) {
  const { type, name } = getTypeAndNameByPath(path)
  if (
    !['view', 'style', 'script', 'layout', 'page', 'codeblock', 'api'].includes(
      type
    )
  ) {
    return
  }

  syncRequest({
    codeArr: [
      {
        type,
        isDelete: true,
        resource: {
          name,
          ...(type === 'page' && { url: `/${name}` })
        }
      }
    ]
  }).then(({ data: [data] }) => {
    if (data.success) {
      console.log(`同步成功: ${path}`)
    } else {
      console.log(`同步失败: ${path}`)
    }
  })
}

/**
 * 根据文件路径提取类型和名称
 * @param path 本地文件路径
 * @returns 包含类型和名称的对象
 */
function getTypeAndNameByPath(path: string) {
  // 处理不同类型的路径格式
  if (path.startsWith('Api/')) {
    const apiPathRegex = /^Api\/(.+)\.ts$/
    const match = path.match(apiPathRegex)
    if (match) {
      return { type: 'api', name: match[1] }
    }
  } else if (path.startsWith('Page/')) {
    const pagePathRegex = /^Page\/(.+)\.html$/
    const match = path.match(pagePathRegex)
    if (match) {
      return { type: 'page', name: match[1] }
    }
  } else if (path.startsWith('Script/')) {
    const scriptPathRegex = /^Script\/(.+)\.js$/
    const match = path.match(scriptPathRegex)
    if (match) {
      return { type: 'script', name: match[1] }
    }
  }

  // 默认处理方式
  const type = path.split('/')[0].toLowerCase()
  const name = path
    .replace(/\.\w+$/, '')
    .split('/')
    .slice(1)
    .join('.')
  return { type, name }
}
