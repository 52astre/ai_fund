import type { FundDetail } from "@/lib/fund-provider";
import { formatPercent } from "./format";

type FundAssetAllocationProps = {
  allocation: FundDetail["assetAllocation"];
  industries: FundDetail["industryAllocation"];
};

export function FundAssetAllocation({
  allocation,
  industries,
}: FundAssetAllocationProps) {
  const allocationItems = [
    { label: "股票占比", value: allocation.stock, color: "bg-red-500" },
    { label: "债券占比", value: allocation.bond, color: "bg-blue-500" },
    { label: "现金占比", value: allocation.cash, color: "bg-emerald-500" },
    { label: "其他占比", value: allocation.other, color: "bg-slate-500" },
  ];
  const hasAllocation = allocationItems.some((item) => item.value !== null);

  return (
    <section id="holding" className="scroll-mt-24 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="border border-slate-200 bg-white p-5">
        <h2 className="text-xl font-semibold tracking-normal text-slate-950">
          资产配置
        </h2>
        {hasAllocation ? (
          <div className="mt-4 space-y-4">
            {allocationItems.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-slate-700">{item.label}</span>
                  <span className="text-slate-950">{formatPercent(item.value)}</span>
                </div>
                <div className="mt-2 h-2 bg-slate-100">
                  <div
                    className={`h-2 ${item.color}`}
                    style={{ width: `${Math.max(0, Math.min((item.value ?? 0) * 100, 100))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
            暂无数据
          </div>
        )}
      </div>

      <div className="border border-slate-200 bg-white p-5">
        <h2 className="text-xl font-semibold tracking-normal text-slate-950">
          行业配置
        </h2>
        {industries.length === 0 ? (
          <div className="mt-4 border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
            暂无数据
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[460px] border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="border border-slate-200 px-3 py-2 font-medium">行业名称</th>
                  <th className="border border-slate-200 px-3 py-2 font-medium">占净值比例</th>
                  <th className="border border-slate-200 px-3 py-2 font-medium">涨跌幅</th>
                </tr>
              </thead>
              <tbody>
                {industries.map((item) => (
                  <tr key={item.industry}>
                    <td className="border border-slate-200 px-3 py-2">{item.industry}</td>
                    <td className="border border-slate-200 px-3 py-2">{formatPercent(item.ratio)}</td>
                    <td className="border border-slate-200 px-3 py-2">{formatPercent(item.change)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
