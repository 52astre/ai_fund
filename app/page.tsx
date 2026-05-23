import Link from "next/link";

const disclaimer = "不构成投资建议，仅供个人分析参考。";

const navigationItems = [
  {
    href: "/funds",
    title: "基金数据",
    description: "查看统一 Provider 返回的基金 mock 数据。",
  },
  {
    href: "/holdings",
    title: "我的持仓",
    description: "后续用于查看和维护本地 SQLite 持仓。",
  },
  {
    href: "/analysis",
    title: "投资分析",
    description: "后续承载分析引擎、风控规则和建议说明。",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen px-6 py-12">
      <section className="mx-auto flex max-w-5xl flex-col gap-8">
        <div>
          <p className="text-sm font-medium text-slate-500">个人自用工具</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-normal text-slate-950">
            AI 基金投资顾问
          </h1>
        </div>

        <p className="max-w-2xl text-base leading-7 text-slate-600">
          当前按“数据获取 → 分析引擎 → 风控规则 → 建议引擎 → AI
          解释”的流程逐步实现。你可以从这里进入已预留的功能页面。
        </p>

        <nav aria-label="功能导航" className="grid gap-4 md:grid-cols-3">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="border border-slate-200 bg-white p-5 transition hover:border-slate-400 hover:bg-slate-50"
            >
              <span className="text-lg font-semibold text-slate-950">
                {item.title}
              </span>
              <span className="mt-3 block text-sm leading-6 text-slate-600">
                {item.description}
              </span>
            </Link>
          ))}
        </nav>

        <div className="border-l-4 border-amber-500 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
          {disclaimer}
        </div>
      </section>
    </main>
  );
}
