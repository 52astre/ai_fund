import Link from "next/link";
import { z } from "zod";
import { deleteHoldingAction, saveHoldingAction } from "@/app/holdings/actions";
import { disclaimer, fundProvider } from "@/lib/fund-provider";
import { listHoldingViews } from "@/lib/holdings";

const searchParamsSchema = z.object({
  edit: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((value) => (Array.isArray(value) ? value[0] : value)),
});

type HoldingsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const formatNumber = (value: number, fractionDigits = 4) =>
  new Intl.NumberFormat("zh-CN", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);

const formatPercent = (value: number) => `${(value * 100).toFixed(2)}%`;

const getReturnClassName = (value: number) => {
  if (value > 0) {
    return "text-red-600";
  }

  if (value < 0) {
    return "text-emerald-600";
  }

  return "text-slate-950";
};

const formatSource = (isMock: boolean) =>
  isMock ? "当前为模拟数据，未成功获取互联网基金数据" : "数据来源：天天基金/东方财富";

export default async function HoldingsPage({ searchParams }: HoldingsPageProps) {
  const parsedSearchParams = searchParamsSchema.safeParse(
    (await searchParams) ?? {},
  );
  const editId = parsedSearchParams.success
    ? parsedSearchParams.data.edit
    : undefined;
  const [holdings, fundOptions] = await Promise.all([
    listHoldingViews(),
    fundProvider.searchFunds(""),
  ]);
  const editingHolding = holdings.find((holding) => holding.id === editId);
  const hasRealOptionData = fundOptions.some((fund) => !fund.isMock);
  const hasRealHoldingNav = holdings.some((holding) => !holding.latestNavIsMock);

  return (
    <main className="min-h-screen px-6 py-10">
      <section className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-slate-500">
              SQLite 本地数据
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">
              我的持仓
            </h1>
            <p className="mt-4 max-w-2xl text-slate-600">
              手动维护基金份额与成本价，系统按最新单位净值估算持仓金额和收益表现。
            </p>
            <p
              className={`mt-4 inline-flex border px-3 py-2 text-sm font-medium ${
                hasRealOptionData || hasRealHoldingNav
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-amber-200 bg-amber-50 text-amber-900"
              }`}
            >
              {formatSource(!(hasRealOptionData || hasRealHoldingNav))}
            </p>
          </div>
          <Link
            href="/funds"
            className="inline-flex min-h-11 items-center justify-center border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 transition hover:border-slate-500 hover:text-slate-950"
          >
            查询基金
          </Link>
        </div>

        <form
          action={saveHoldingAction}
          className="mt-8 grid gap-4 border border-slate-200 bg-white p-4 lg:grid-cols-6"
        >
          <input
            name="holdingId"
            type="hidden"
            value={editingHolding?.id ?? ""}
          />
          <div className="lg:col-span-2">
            <label
              className="text-sm font-medium text-slate-700"
              htmlFor="fundCode"
            >
              基金
            </label>
            <select
              id="fundCode"
              name="fundCode"
              defaultValue={editingHolding?.fundCode ?? fundOptions[0]?.code}
              className="mt-2 min-h-11 w-full border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-slate-600"
              required
            >
              {fundOptions.map((fund) => (
                <option key={fund.code} value={fund.code}>
                  {fund.code} {fund.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              className="text-sm font-medium text-slate-700"
              htmlFor="units"
            >
              份额
            </label>
            <input
              id="units"
              name="units"
              type="number"
              step="0.0001"
              min="0.0001"
              defaultValue={editingHolding?.units ?? ""}
              placeholder="1000.0000"
              className="mt-2 min-h-11 w-full border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-600"
              required
            />
          </div>
          <div>
            <label
              className="text-sm font-medium text-slate-700"
              htmlFor="averageCost"
            >
              成本价
            </label>
            <input
              id="averageCost"
              name="averageCost"
              type="number"
              step="0.0001"
              min="0.0001"
              defaultValue={editingHolding?.averageCost ?? ""}
              placeholder="1.0000"
              className="mt-2 min-h-11 w-full border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-600"
              required
            />
          </div>
          <div>
            <label
              className="text-sm font-medium text-slate-700"
              htmlFor="purchaseDate"
            >
              建仓日期
            </label>
            <input
              id="purchaseDate"
              name="purchaseDate"
              type="date"
              defaultValue={
                editingHolding?.purchaseDate ??
                new Date().toISOString().slice(0, 10)
              }
              className="mt-2 min-h-11 w-full border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-slate-600"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="note">
              备注
            </label>
            <input
              id="note"
              name="note"
              type="text"
              maxLength={200}
              defaultValue={editingHolding?.note ?? ""}
              placeholder="可选"
              className="mt-2 min-h-11 w-full border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-600"
            />
          </div>
          <div className="flex gap-3 lg:col-span-6">
            <button
              type="submit"
              className="min-h-11 bg-slate-950 px-5 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              {editingHolding ? "保存修改" : "新增持仓"}
            </button>
            {editingHolding ? (
              <Link
                href="/holdings"
                className="inline-flex min-h-11 items-center justify-center border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 transition hover:border-slate-500 hover:text-slate-950"
              >
                取消编辑
              </Link>
            ) : null}
          </div>
        </form>

        <div className="mt-8 overflow-x-auto border border-slate-200 bg-white">
          <table className="w-full min-w-[960px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">基金</th>
                <th className="px-4 py-3 font-medium">份额</th>
                <th className="px-4 py-3 font-medium">成本价</th>
                <th className="px-4 py-3 font-medium">持仓金额</th>
                <th className="px-4 py-3 font-medium">当前收益</th>
                <th className="px-4 py-3 font-medium">总收益率</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {holdings.length > 0 ? (
                holdings.map((holding) => (
                  <tr key={holding.id}>
                    <td className="px-4 py-3">
                      <Link
                        href={`/funds/${holding.fundCode}`}
                        className="font-medium text-slate-950 transition hover:text-slate-600"
                      >
                        {holding.fundName}
                      </Link>
                      <div className="mt-1 font-mono text-xs text-slate-500">
                        {holding.fundCode} · {holding.fundType}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {formatNumber(holding.units)}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {formatNumber(holding.averageCost)}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-950">
                      {formatCurrency(holding.holdingAmount)}
                      <div className="mt-1 text-xs font-normal text-slate-500">
                        最新净值 {formatNumber(holding.latestUnitNav)} ·{" "}
                        {holding.latestNavIsMock
                          ? "模拟数据"
                          : "天天基金/东方财富"}
                      </div>
                    </td>
                    <td
                      className={`px-4 py-3 font-medium ${getReturnClassName(
                        holding.currentReturn,
                      )}`}
                    >
                      {formatCurrency(holding.currentReturn)}
                    </td>
                    <td
                      className={`px-4 py-3 font-medium ${getReturnClassName(
                        holding.totalReturnRate,
                      )}`}
                    >
                      {formatPercent(holding.totalReturnRate)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/holdings?edit=${holding.id}`}
                          className="font-medium text-slate-700 transition hover:text-slate-950"
                        >
                          编辑
                        </Link>
                        <form action={deleteHoldingAction}>
                          <input name="id" type="hidden" value={holding.id} />
                          <button
                            type="submit"
                            className="font-medium text-rose-700 transition hover:text-rose-900"
                          >
                            删除
                          </button>
                        </form>
                        <Link
                          href={`/analysis?holdingId=${holding.id}`}
                          className="font-medium text-slate-700 transition hover:text-slate-950"
                        >
                          分析
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-sm text-slate-500"
                  >
                    暂无持仓，请先新增一条本地持仓记录。
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
