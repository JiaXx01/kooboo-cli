# Kooboo-CLI

## 使用

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

## 项目结构

```bash
.
├── package.json
├── pnpm-lock.yaml
├── scripts
│   └── dev.js (同步脚本)
├── src
│   ├── Api (对应Kooboo的Api目录)
│   │   └── __logout.ts
│   ├── CodeBlock (对应Kooboo的CodeBlock目录)
│   ├── Layout (对应Kooboo的Layout目录)
│   ├── Page (对应Kooboo的Page目录)
│   ├── Script (对应Kooboo的Script目录)
│   ├── Style (对应Kooboo的Style目录)
│   └── View (对应Kooboo的View目录)
└── tsconfig.json
```
