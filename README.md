# 中楚拍卖交易平台 PC 原型

这是一个基于 Vue 3、Vite、TypeScript、Pinia、Vue Router 和 Element Plus 的拍卖/挂牌交易平台 PC 端原型。项目目前使用前端本地 mock 数据模拟前台、交易企业端和平台管理端的核心流程。

## 环境要求

- Node.js 20+，建议使用当前 LTS 版本
- npm 10+

## 本地启动

首次拉取后安装依赖：

```bash
npm install
```

启动开发服务：

```bash
npm run dev
```

默认访问地址：

- 本机访问：http://localhost:5373
- 局域网访问：Vite 会在启动日志中输出 Network 地址

## 常用脚本

```bash
npm run dev
```

启动 Vite 开发服务，默认端口 `5373`。

```bash
npm run type-check
```

执行 Vue 与 TypeScript 类型检查。

```bash
npm run build
```

先执行类型检查，再打包生产构建，产物输出到 `dist/`。

```bash
npm run preview
```

预览生产构建，默认端口 `4373`。

## 登录与角色

项目当前没有接入真实后端鉴权，登录行为由前端模拟：

- 竞买人入口：`/login`
- 交易企业入口：`/merchant/login`
- 平台入口：`/platform/login`

登录页默认账号为：

- 用户名：`suqcir`
- 密码：`123456`

说明：

- 密码字段当前不做真实校验。
- 登录角色由当前登录入口决定。
- 管理端布局会根据访问路径自动切换到对应模拟角色。
- 登录状态保存在 `localStorage` 的 `zcpm-auth-user`。

## 主要路由

前台：

- `/` 首页
- `/announcements` 公告
- `/bidding` 竞价标的
- `/listings` 挂牌标的
- `/assets/:id` 标的详情
- `/hall` 交易会大厅
- `/hall/:id` 交易会详情
- `/results` 结果公示
- `/enterprise` 商户入驻
- `/partners` 合作机构
- `/help` 帮助中心
- `/news` 新闻中心
- `/account` 竞买人账户中心

交易企业端：

- `/merchant/bidders` 竞买人管理
- `/merchant/announcements` 交易公告管理
- `/merchant/meetings` 交易会管理
- `/merchant/assets` 标的管理
- `/merchant/materials` 标的数量证明材料管理
- `/merchant/publicity` 信息公示管理
- `/merchant/company` 企业信息维护

平台端：

- `/platform/organizations` 机构管理
- `/platform/departments` 部门管理
- `/platform/authorization` 分级授权
- `/platform/user-audit` 用户审核
- `/platform/users` 用户管理
- `/platform/publicity` 信息公示管理
- `/platform/announcements` 交易公告管理
- `/platform/meetings` 交易会管理
- `/platform/assets` 标的管理
- `/platform/listings` 挂牌标的
- `/platform/entry` 入驻申请
- `/platform/news` 新闻中心
- `/platform/resources` 静态资源配置

## 目录说明

```text
src/
  main.ts                 应用入口，注册 Pinia、Router、Element Plus
  App.vue                 根组件，负责主题初始化
  router/index.ts         前台、交易企业端、平台端路由配置
  layouts/                前台布局与后台管理布局
  views/                  页面级组件
    public/               前台页面
    auth/                 登录、注册页面
    account/              竞买人账户中心
    admin/                交易企业端和平台端共用管理页面
  components/             通用展示组件
  stores/                 Pinia 状态管理
  mock/seed.ts            演示数据种子
  styles/                 全局样式与主题变量
  types.ts                业务类型定义
  utils/format.ts         金额、日期等格式化工具
public/                   静态资源
```

## 数据与状态

演示数据集中在 `src/mock/seed.ts`，类型定义在 `src/types.ts`。

核心状态由 `src/stores/auction.ts` 管理：

- 首次进入页面时，将 `seedDb()` 写入 `localStorage`
- 业务操作会更新同一份本地数据，实现前台、商家端、平台端之间的模拟联动
- 数据缓存 key 为 `zcpm-shared-db`
- 如需恢复初始数据，可调用 `resetDemoData()`

主题状态由 `src/stores/theme.ts` 管理：

- 主题缓存 key 为 `zcpm-theme`
- 主题变量定义在 `src/styles/theme.css`

清空浏览器 `localStorage` 后，页面会重新加载初始演示数据。

## 开发约定

- 使用 `@` 指向 `src`，配置在 `vite.config.ts`。
- 页面组件放在 `src/views`，通用组件放在 `src/components`。
- 新增业务字段时，优先同步更新 `src/types.ts` 与 `src/mock/seed.ts`。
- 新增页面时，在 `src/router/index.ts` 中使用懒加载路由。
- 后台管理页面尽量复用 `src/layouts/AdminLayout.vue` 和现有管理视图模式。
- 涉及数据变更的交互应通过 Pinia store 方法处理，并在方法内调用 `persist()`。
- UI 优先使用 Element Plus 组件；图标可使用 Element Plus Icons 或 `lucide-vue-next`。
- 主题色、边框、阴影等尽量使用 `src/styles/theme.css` 中的 CSS 变量。

## 接入后端时的改造点

当前项目为纯前端原型。接入真实服务时，建议优先处理：

1. 将 `src/stores/auth.ts` 的模拟登录替换为真实登录、刷新和退出接口。
2. 将 `src/stores/auction.ts` 中的本地 `localStorage` 数据替换为 API 请求。
3. 为竞价、报名、保证金、审核、发布等关键动作增加接口错误态和加载态。
4. 明确路由权限守卫，避免仅依赖当前模拟角色自动切换。
5. 根据后端返回结构调整 `src/types.ts`，并保留必要的数据适配层。

## 提交注意事项

`.gitignore` 已忽略以下内容：

- `node_modules/`
- `dist/`
- `.env*`
- `*.log`
- `coverage/`

提交前建议至少运行：

```bash
npm run build
```
