import { declare } from '@babel/helper-plugin-utils'

const importCodeBlockTransformer = declare((api, options, dirname) => {
  api.assertVersion(7)

  return {
    visitor: {
      Program: {
        enter(path, state) {
          path.traverse({
            ImportDeclaration(path) {
              const localPath = path.node.source.value
              if (localPath.startsWith('@CodeBlock/')) {
                // 分割路径
                const pathParts = localPath.split('/')

                // 移除 @CodeBlock 前缀
                pathParts.shift()

                if (pathParts.length > 0) {
                  let newPath = './'

                  if (pathParts.length === 1) {
                    // 如果只有一个部分，例如 @CodeBlock/a 变为 ./a
                    newPath += pathParts[0]
                  } else {
                    // 如果有多个部分，例如 @CodeBlock/a/b 变为 ./a.b
                    newPath += pathParts[0]

                    if (pathParts.length > 1) {
                      // 处理剩余部分，将 / 替换为 .
                      const remainingParts = pathParts.slice(1)
                      newPath += '.' + remainingParts.join('.')
                    }
                  }

                  // 更新导入路径
                  path.node.source.value = newPath
                }
              }
            }
          })
        }
      }
    }
  }
})

export default importCodeBlockTransformer
