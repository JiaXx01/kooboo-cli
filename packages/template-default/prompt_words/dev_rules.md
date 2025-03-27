# 技术栈
1. 前端: Vue3 + Element-Plus + tailwind
2. 图表: Echarts
3. 后端: k-script 
   1. docs_url: https://achen-11.github.io/kooboo-dev-guide/api/k-api.html
4. 数据库: sqlite

# 目录结构规范
src
├── Api (接口目录)
│   └── __logout.ts
├── CodeBlock (服务层代码目录: 包括 Services, Models, utils 等)
│   ├── Models (数据模型目录)
│   │   └── users.ts
│   ├── Services (服务层目录)
│   │   └── user.ts
│   └── utils.ts (工具函数文件)
├── Layout (布局目录)
│   └── main.html
├── Page (页面目录, 当前项目为单页面项目)
│   └── home.html
├── Script (前端脚本目录, 包括依赖, 工具函数等)
│   ├── axios.js
├── Style (样式文件目录)
│   ├── element-plus.css
│   ├── main.css
│   └── reset.css
└── View (组件目录, 当前模板组要包括 pages, components, 公共组件等)
    ├── common-vue.html
    ├── common.html
    ├── common_routes.html
    ├── components (组件目录)
    │   ├── app-header.html
    │   ├── app-sidebar.html
    └── pages (除去 home 作为 router-view 的定义页面, 其他页面对应 common_routes 中的路由组件)
        ├── home.html
        └── dashboard.html

# 前端

## View 规范

1. kooboo 也没有包管理器的概念, 所有的第三方库都需要通过 <link> 和 <script> 标签进行引入
2. 无需开发登录页, 直接使用 kooboo 内置的登录流程即可(该模版已集成)
   - 参考: (https://achen-11.github.io/kooboo-dev-guide/dev-guide/practice/Vue-quickly/login.html)
3. 在使用 Views 下的组件时, 需要先通过<view id="viewName"></view>的方式进行引入(文件夹使用.进行分隔)
    - 例如: `<view id="pages.dashboard">
    - 注意:
      - 1. <view>不需要重复引入, 全局只需要有一处引入即可, 否则会导致重复注册
      - 2.注册 page view 时, 需要在 common-vue.html 顶部声明, 而不是 common_routes
        - 原因: 执行到 common_routes 时已经注册完组件了
4. 前端请求基于 `Scripts/http.js` 封装
   - 错误写法：检查 `response.data.success` 和处理 `response.data.message`
   - 正确写法：直接使用 `response.data`，因为 http.js 中的拦截器已经处理了错误情况
5. **表单初始化**
   - 错误：表单对象中缺少 `_id` 字段，导致更新操作异常
   - 正确：确保表单对象包含所有必要字段，特别是用于标识的 `_id` 字段
  
## Element-plus常见使用错误
1. **el-icon 使用**
   - 错误写法：使用 `<el-icon><arrow-up /></el-icon>` 格式
   - 正确写法(使用<icon-xxx>, 并通过 class 定义宽高):  
     - `<el-button @click="goBack" icon="icon-arrow-left" class="mr-2"></el-button>`
2. **不能使用自闭合标签**
   - 错误写法：使用自闭合标签 `<el-table-column />`
   - 正确写法：使用双闭合标签 `<el-table-column></el-table-column>`
3. **UI 布局与表单元素样式**
   - 正确：为el-select(下拉选择框)设置固定宽度，如 `class="w-[160px]"`，根据内容长度调整

# 服务端
## 文件引用规范
1. 在Api 和 CodeBLock 下的文件引用时需要使用@进行引用
   - 错误写法: import UserModel from '../Models/user'
   - 正确写法: import UserModel from '@CodeBlock/Models/user'
   - 
## API 开发规范
1. 使用 k.api 进行 api 定义
   - 文档: https://achen-11.github.io/kooboo-dev-guide/api/k-api.html
2. API 路由命名
   - 错误：使用 `k.api.get("/:id", (id) => {})` 这样的路由参数格式
   - 正确：使用 `k.api.get("detail", () => {})` 并通过 `k.request.queryString.id` 获取参数
3. API 参数获取
   - 错误：使用 `ctx.request.body`, `ctx.params`, `ctx.query` 等 Express/Koa 风格的参数获取
   - 正确：
     - params 通过 `k.request.queryString` 获取
     - body 直接通过回调函数参数获取，如 `k.api.post("create", (body) => {})`
     - formData 通过`k.request.form.get(key)` 获取
4. 响应格式
   - 错误：手动构造 `{ success: true, data: result }` 格式的响应
   - 正确：使用 `utils.ts` 中的 `successResponse` 和 `failResponse` 函数统一响应格式
5. API 和 CodeBlock 都不存在异步处理, 因此都不需要 async, await 语法, 直接使用回调函数进行处理
   - 错误写法: 
      ```ts
      k.api.post('create', async (body) => {})
      ```
   - 正确写法: 
      ```ts
      k.api.post('create', (body) => {})
      ```


## 数据库操作规范

1. 使用 sqlite 作为数据库
   - k.DB 文档: https://achen-11.github.io/kooboo-dev-guide/api/k-DB.html
2. kooboo的表自带 `_id` 作为主键, 不需要手动创建和管理
3. 可以使用 sqlite_orm_v2 进行便捷操作, 也可以使用 `k.DB.sqlite.query(sql)` 执行原生 sql
4. SQL 查询参数传递
   - 错误：使用数组形式传递参数，如 `k.DB.sqlite.query(sql, [param1, param2])`，或使用 `?` 作为参数占位符
   - 正确：使用命名参数对象，如 `k.DB.sqlite.query(sql, { key1: value1, key2: value2 })`，并在 SQL 中使用 `@key` 形式的参数占位符
5. API路径定义
   - 通过文件夹进行定义前缀, 只需要定义特定路径, 例如: 定义 `api/product/create`, 需要在`Api`目录下创建`product.ts`文件, 然后定义
        ```ts
        k.api.post('create', (body) => {
        // 处理逻辑
        })
        ```

**正确写法**：
```ts
k.api.post('create', (body) => {
    // 处理逻辑
})
```

## sqlite_orm_v2 使用规范
1. 不支持模糊查询, 不支持大小比较, 如"$glt", "$gte", "$like"等
   - 错误：依赖 sqlite_orm_v2 的 `$like` 操作符
   - 正确：对于模糊查询和比较大小，使用原生 SQL 查询 `k.DB.sqlite.query(sql, params)`
2. 查询时的排序参数
   - 错误：使用 `sort: { created: -1 }` 格式的排序参数
   - 正确：使用 `sort: { prop: 'created', order: 'descending' }` 格式
3. 分页查询结果处理
   - 错误：对 `findPaginated` 返回的结果进行额外包装，如 `return successResponse({ list: result.items, total: result.total, ... })`
   - 正确：直接返回 `findPaginated` 的结果，如 `return successResponse(result)`，因为它已经包含了 `list` 和 `total` 字段
4. 查询方法使用
   - 错误：使用 `find` 方法查询所有记录，如 `OrderItemModel.find({ orderId: id })`
   - 正确：
     1. 使用 `findAll` 方法查询所有记录，如 `OrderItemModel.findAll({ orderId: id })`,
     2. 使用 `findPaginated` 方法查询分页记录，如 `OrderItemModel.findPaginated({ orderId: id}, { page: 1, pageSize: 10 })` (更复杂的查询建议直接通过 `k.DB.sqlite.query(sql, params)`查询)
     3. 使用 `findOne` 方法查询单条记录，如 `OrderItemModel.findOne({ orderId: id })`
     4. 使用 `findById` 方法查询单条记录，如 `OrderItemModel.findById(id)`
     5. 使用 `k.DB.sqlite.query` 执行原生 sql 进行查询
5. 查询方法错误传参
   - 错误写法: 在查询方法中, 将所有查询内容放在第一个参数, 例如: `OrderItemModel.find({ orderId: id, sort: {prop: 'created', order: 'descending'} })`
   - 正确写法: 第一个参数是字段查询 where, 第二个参数才是其他配置参数, 如: `OrderItemModel.findAll({ orderId: id }, {sort: { prop: 'created', order: 'descending' }})`
6. 自动创建 created 和 updated 字段
    - 在使用 sqlite_orm_v2 定义模型时，可以通过 `define` 方法的第二个参数 `options` 中的 `timestamps` 选项来自动添加 `created` 和 `updated` 字段，无需手动在模型中定义这些字段。
7. 枚举类型的正确引用方式
   - 在定义模型字段类型时，对于枚举类型的引用有特定的语法格式。
   - 正确的枚举类型引用:
        ```ts
        // 定义枚举
        export enum ProductStatus {
            Pending,
            Passed,
            Rejected
        }

        // 在模型中引用枚举
        const model = define("products", {
            // ...其他字段
            status: {
                type: <ProductStatus>Number, // 使用 <枚举名>基础类型 的格式
                default: ProductStatus.Pending
            },
            size: {
                type: <'xs' | 'lg' | 'xl'>String, // 使用联合类型限制字符串值
            }
        })
        ```
8. 日期类型字段的正确声明方式
   - 在定义模型字段类型时，对于日期类型字段的声明有特定的语法格式。
   - 正确的日期类型字段声明:
        ```ts
        import { define, DataTypes } from 'module:sqlite_orm_v2'
        // 定义日期类型字段
        const model = define("products", {
            // ...其他字段
            published: {
                type: DataTypes.Timestamp,
                default: Date.now()
            }
        })

# 其他注意事项

1. **错误处理**
   - 在服务层应该捕获所有可能的异常，并返回适当的错误响应
   - 在 API 层应该简化代码，直接调用服务层方法并返回结果

2. **代码一致性**
   - 确保枚举值和状态映射在整个应用中保持一致
   - 确保命名风格统一（如 camelCase 或 snake_case）