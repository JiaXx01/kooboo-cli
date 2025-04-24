# Kooboo-CLI

kooboo-cli 是快速建站平台 kooboo 的本地开发环境集成

- packages
  - core 脚手架核心包
  - create 创建项目指令包
  - sync 开发代码同步包
  - types KScript 语法类型包
  - utils 脚手架工具包
  - kooboo_cli 对 core 的瘦包装，简化命令
  - template-xxx 预设 kooboo 开发模板
  - \_test_sync 测试项目

### 创建项目

```bash
npx kooboo_cli create
# 或
npx @kooboo_cli/core create
```

### 初始化

```bash
cd 项目目录

# pnpm
pnpm install

pnpm dev:init # 将本地代码初始化推送到远端

# npm
npm install
npm run dev:init # 将本地代码初始化推送到远端
```

### 开发

该命令会运行监听脚本, 即本地代码发生变化时, 会自动同步到远端

```bash
# pnpm
pnpm dev

# npm
npm run dev
```
