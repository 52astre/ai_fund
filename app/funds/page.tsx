import Link from "next/link";
import { z } from "zod";
import { disclaimer, fundProvider } from "@/lib/fund-provider";

const searchParamsSchema = z.object({
  q: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((value) => {
      if (Array.isArray(value)) {
        return value[0] ?? "";
      }

      return value ?? "";
    })
    .pipe(z.string().trim().max(50, "搜索关键词不能超过 50 个字符")),
});

type FundsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function FundsPage({ searchParams }: FundsPageProps) {
  const parsedSearchParams = searchParamsSchema.safeParse(
    (await searchParams) ?? {},
  );
  const keyword = parsedSearchParams.success ? parsedSearchParams.data.q : "";
  const funds = await fundProvider.searchFunds(keyword);
  const hasRealData = funds.some((fund) => !fund.isMock);
  const sourceMessage = hasRealData
    ? "数据来源：天天基金/东方财富"
    : "当前为模拟数据，未成功获取互联网基金数据";

  return (
    <main className="min-h-screen px-6 py-10">
      <section className="mx-auto max-w-5xl">
        <div>
          <p className="text-sm font-medium text-slate-500">统一 Provider 数据</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">
            基金数据
          </h1>
          <p className="mt-4 max-w-2xl text-slate-600">
            输入基金名称或 6 位基金代码，通过统一 Provider 查询基金基础数据。
          </p>
          <p
            className={`mt-4 inline-flex border px-3 py-2 text-sm font-medium ${
              hasRealData
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-amber-200 bg-amber-50 text-amber-900"
            }`}
          >
            {sourceMessage}
          </p>
        </div>

        <form action="/funds" className="mt-8 flex flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="fund-search">
            基金名称或基金代码
          </label>
          <input
            id="fund-search"
            name="q"
            type="search"
            defaultValue={keyword}
            placeholder="请输入基金名称或代码"
            className="min-h-11 flex-1 border border-slate-300 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-600"
          />
          <button
            type="submit"
            className="min-h-11 bg-slate-950 px-5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            搜索
          </button>
          {keyword ? (
            <Link
              href="/funds"
              className="inline-flex min-h-11 items-center justify-center border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 transition hover:border-slate-500 hover:text-slate-950"
            >
              清空
            </Link>
          ) : null}
        </form>

        <div className="mt-8 overflow-hidden border border-slate-200">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">基金代码</th>
                <th className="px-4 py-3 font-medium">基金名称</th>
                <th className="px-4 py-3 font-medium">基金类型</th>
                <th className="px-4 py-3 font-medium">基金规模</th>
                <th className="px-4 py-3 font-medium">数据来源</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {funds.length > 0 ? (
                funds.map((fund) => (
                  <tr key={fund.code} className="bg-white">
                    <td className="px-4 py-3 font-mono text-slate-900">
                      {fund.code}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-950">
                      {fund.name}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{fund.type}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {fund.fundSize}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {fund.isMock ? "模拟数据" : "天天基金/东方财富"}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/funds/${fund.code}`}
                        className="font-medium text-slate-700 transition hover:text-slate-950"
                      >
                        查看详情
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="bg-white">
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-sm text-slate-500"
                  >
                    未找到匹配的基金，请尝试更换基金名称或基金代码。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-6 border-l-4 border-amber-500 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
          {disclaimer}
        </p>
      </section>
    </main>
  );
}
