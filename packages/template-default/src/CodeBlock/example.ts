// 直接使用全局类型，无需导入
const config: CodeBlockConfig = {
  name: 'Button',
  type: 'component',
  dependencies: ['react']
}

// 使用命名空间中的类型
const componentConfig: CodeBlock.ComponentConfig = {
  name: 'Button',
  props: {
    onClick: 'function',
    children: 'ReactNode'
  }
}

// 使用全局类型别名
const blockType: CodeBlockType = 'component'

export { config, componentConfig, blockType }
