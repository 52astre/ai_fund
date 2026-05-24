# AGENTS.md

## 项目概况

这是一个个人自用的 AI 基金投资顾问工具，基于 Next.js App Router、TypeScript、Tailwind CSS、Prisma、SQLite、OpenAI API、Recharts 和 Zod。当前项目重点是基金数据展示、本地持仓维护、基金详情页和后续分析/风控/建议引擎的骨架。

核心原则：

- 界面和面向用户的文案使用简体中文。
- 所有投资相关内容必须展示免责声明：`不构成投资建议，仅供个人分析参考`。
- AI 只能解释分析过程，不能直接决定买卖。
- 不伪造真实基金数据；真实网络基金数据必须通过 `lib/fund-provider.ts` 的抽象层接入。
- 如果真实数据不可用，可以明确标记为 mock 数据并兜底展示。

## 技术栈

- Next.js 15 App Router，React 19，TypeScript 5.7。
- Tailwind CSS 3.4 做页面样式。
- Prisma 6 + SQLite，本地数据库由 `DATABASE_URL` 指定。
- Zod 用于路由参数、表单和 Provider 返回结构校验。
- Vitest 用于单元测试。
- Recharts 用于净值图表。

## 常用命令

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
npm run test
```

如修改 Prisma schema，通常需要按项目状态补充运行 Prisma generate/db push/migration 相关命令；当前 `package.json` 未定义专门的 Prisma 脚本。

## 环境变量

参考 `.env.example`：

```bash
DATABASE_URL="file:./dev.db"
OPENAI_API_KEY=""
FUND_DATA_PROVIDER=eastmoney
FUND_DATA_TIMEOUT_MS=8000
FUND_DATA_PROXY_URL=
```

`FUND_DATA_PROVIDER=mock` 可强制使用 mock provider。`FUND_DATA_PROXY_URL` 当前在 Provider 里只支持 `http://` 代理。

## 目录地图

- `app/page.tsx`：首页和功能入口。
- `app/funds/page.tsx`：基金搜索/列表页，通过统一 Provider 查询。
- `app/funds/[code]/page.tsx`：基金详情页，展示概况、净值、阶段涨幅、档案、经理、资产配置、持仓联动、费率、分红和风险提示。
- `app/api/funds/[code]/route.ts`：基金详情 JSON API。
- `app/api/funds/[code]/diagnostics/route.ts`：开发期基金数据链路诊断 API。
- `app/holdings/page.tsx`：本地持仓列表和新增/编辑表单。
- `app/holdings/actions.ts`：持仓增删改的 Server Actions。
- `app/analysis/page.tsx`：投资分析预留页，目前不生成投资建议。
- `components/fund/*`：基金详情页拆分组件和格式化工具。
- `components/fund-nav-chart.tsx`：净值图表组件。
- `lib/fund-provider.ts`：基金数据核心抽象、Zod schema、东方财富 Provider、MockProvider、FallbackProvider 和诊断逻辑。
- `lib/holdings.ts`：持仓表单 schema、持仓视图聚合、基金自动创建、持仓 CRUD。
- `lib/prisma.ts`：PrismaClient 单例。
- `lib/analysis.ts`、`lib/risk.ts`、`lib/recommendation.ts`、`lib/ai.ts`：后续分析、风控、建议和 AI 解释入口，目前基本是占位。
- `prisma/schema.prisma`：Fund、Holding、FundNav、AnalysisReport、Recommendation 数据模型。
- `prisma/seed.ts`：mock 基金、净值、持仓、分析报告和建议数据。
- `tests/fund-provider.test.ts`：Provider、解析、fallback、诊断和页面依赖约束测试。
- `tests/smoke.test.ts`：基础免责声明 smoke test。

## 数据 Provider 约定

`lib/fund-provider.ts` 是基金数据唯一入口。后续新增数据源时，应实现 `FundProvider` 接口：

- `searchFunds(keyword)`
- `getFundInfo(code)`
- `getFundNavHistory(code)`
- `getFundPerformance(code)`
- `getFundDetail(code)`

所有 Provider 返回值都要经过对应 Zod schema 校验。基金代码必须是 6 位数字。Provider 返回结构包含：

- `source`: 当前为 `eastmoney` 或 `mock`
- `isMock`: 是否为模拟数据
- `updatedAt`: ISO 时间
- `disclaimer`: 涉及投资分析/展示时要保留统一免责声明

默认 Provider 逻辑：

- `FUND_DATA_PROVIDER=mock` 时直接使用 MockProvider。
- 默认使用 `EastMoneyFundProvider`，失败时通过 `FallbackFundProvider` 回落到 MockProvider。
- 真实接口只有核心字段完全不可用时才 fallback；如果 JSONP 或历史净值能提供核心字段，仍应标记为 `eastmoney`。

## 持仓和数据库约定

本地持仓通过 Prisma 写入 SQLite。`lib/holdings.ts` 会在新增/编辑持仓时根据基金代码调用 Provider 获取基金基础信息，若本地 Fund 不存在则自动创建。

持仓收益估算逻辑：

- 优先读取本地 `FundNav` 最新净值。
- 如果本地无净值，则调用 Provider 获取最新历史净值。
- 持仓金额 = 份额 * 最新单位净值。
- 当前收益 = 持仓金额 - 份额 * 成本价。
- 收益率 = 当前收益 / 总成本。

注意 Prisma Decimal 在 UI 层转换为 number 时使用现有 `toNumber` 模式，避免把 Decimal 直接传给客户端组件。

## 页面和 UI 约定

- 页面整体是偏工具型的简洁界面，使用浅色背景、边框、表格和紧凑信息块。
- 不要把系统描述成能给出买卖指令；分析页和建议相关页面必须强调人工判断。
- 基金真实/模拟数据来源要在 UI 上明确显示。
- Next.js 15 当前代码里 `params` 和 `searchParams` 按 Promise 处理，新增页面保持同一模式。
- `app/funds/[code]/page.tsx` 不应直接引用 mock 数据，应始终走 `fundProvider.getFundDetail`。

## 测试重点

修改 Provider 时优先跑：

```bash
npm run test
```

重点保持以下行为：

- JSONP 和东方财富历史净值 HTML 解析正确。
- EastMoney 部分接口失败时，只要核心字段可用，不应直接 fallback。
- 全部真实接口失败时才 fallback 到 MockProvider。
- mock 接口返回结构都能通过 Zod schema。
- 诊断 API 能暴露上游请求和解析状态。
- `/funds/[code]` 页面不能直接引用 `mock-data` 或 `MockProvider`。

修改页面或类型时补充跑：

```bash
npm run typecheck
npm run lint
npm run build
```

## 当前注意事项

- 工作区可能存在未提交改动。不要回滚用户改动；先用 `git status --short` 查看状态。
- README 和部分旧文件在某些终端编码下可能显示乱码，但源码里的中文 UTF-8 内容可以用 `Get-Content -Encoding utf8` 正常读取。
- `node_modules` 已存在，但如果依赖缺失再运行 `npm install`。
- `.env` 存在本地配置，不要把真实密钥写入文档或提交。
- 网络基金数据依赖东方财富接口，受网络、代理和解析格式影响；开发期可访问 `/api/funds/{code}/diagnostics` 查看链路状态。
