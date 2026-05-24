import type { FundDetail } from "@/lib/fund-provider";
import { formatPercent, getReturnClassName } from "./format";

type FundPerformanceTableProps = {
  rows: FundDetail["stagePerformance"];
};

export function FundPerformanceTable({ rows }: FundPerformanceTableProps) {
  return (
    <section id="performance" className="scroll-mt-24 border border-slate-200 bg-white p-5">
      <h2 className="text-xl font-semibold tracking-normal text-slate-950">
        阶段涨幅
      </h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="border border-slate-200 px-3 py-2 font-medium">阶段</th>
              <th className="border border-slate-200 px-3 py-2 font-medium">本基金</th>
              <th className="border border-slate-200 px-3 py-2 font-medium">同类平均</th>
              <th className="border border-slate-200 px-3 py-2 font-medium">沪深300</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <td className="border border-slate-200 px-3 py-2 font-medium text-slate-950">
                  {row.label}
                </td>
                <td className={`border border-slate-200 px-3 py-2 ${getReturnClassName(row.fund)}`}>
                  {formatPercent(row.fund)}
                </td>
                <td className={`border border-slate-200 px-3 py-2 ${getReturnClassName(row.peerAverage)}`}>
                  {formatPercent(row.peerAverage)}
                </td>
                <td className={`border border-slate-200 px-3 py-2 ${getReturnClassName(row.hs300)}`}>
                  {formatPercent(row.hs300)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
