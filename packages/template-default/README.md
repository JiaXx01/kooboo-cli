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
├── prompt_words (预设提示词文件目录)
│   └── dev_rules.md
├── scripts
│   └── dev.js (同步脚本)
├── src
│   ├── Api (对应Kooboo的Api目录)
│   │   └── __logout.ts
│   ├── CodeBlock (对应Kooboo的CodeBlock目录)
│   │   ├── Models
│   │   │   └── users.ts
│   │   ├── Services
│   │   │   └── user.ts
│   │   └── utils.ts
│   ├── Layout (对应Kooboo的Layout目录)
│   │   └── main.html
│   ├── Module (TODO: 对应 Module)
│   │   └── orm
│   │       └── code
│   │           └── index.ts
│   ├── Page (对应Kooboo的Page目录)
│   │   └── home.html
│   ├── Script (对应Kooboo的Script目录)
│   │   ├── axios.js
│   │   ├── dayjs.js
│   │   ├── element-plus-icons.js
│   │   ├── element-plus.js
│   │   ├── element-plus_en.js
│   │   ├── element-plus_zh.js
│   │   ├── http.js
│   │   ├── vue-i18n.js
│   │   ├── vue-router.js
│   │   └── vue.global.js
│   ├── Style (对应Kooboo的Style目录)
│   │   ├── element-plus.css
│   │   ├── main.css
│   │   └── reset.css
│   └── View (对应Kooboo的View目录)
│       ├── common-vue.html
│       ├── common.html
│       ├── common_routes.html
│       ├── components
│       │   ├── app-header.html
│       │   └── sidebar.html
│       └── pages
│           ├── dashboard.html
│           └── home.html
└── tsconfig.json
```
