# AI 基金投资顾问

个人自用的 AI 基金投资顾问工具骨架，基于 Next.js App Router、TypeScript、Tailwind CSS、Prisma、SQLite、OpenAI API、Recharts 和 Zod。

## 当前里程碑

当前只完成项目骨架，不实现基金数据、分析引擎、风控规则、建议引擎或 AI 解释逻辑。

## 核心约束

- 平台界面使用简体中文。
- 不使用 FastAPI、PostgreSQL、Monorepo 或微服务。
- 不伪造真实基金数据。
- 后续网络基金数据必须通过 `lib/fund-provider.ts` 抽象层实现。
- 后续 AI 只负责中文解释，不能直接决定买卖。
- 所有投资相关内容必须展示：不构成投资建议，仅供个人分析参考。

## 本地开发

```bash
npm install
npm run dev
```

## 常用命令

```bash
npm run build
npm run lint
npm run typecheck
npm run test
```

## 环境变量

复制 `.env.example` 为 `.env` 后按需填写：

```bash
DATABASE_URL="file:./dev.db"
OPENAI_API_KEY=""
```
