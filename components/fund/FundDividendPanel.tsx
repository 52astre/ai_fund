import type { FundDetail } from "@/lib/fund-provider";
import { formatText } from "./format";

type FundDividendPanelProps = {
  dividends: FundDetail["dividends"];
};

export function FundDividendPanel({ dividends }: FundDividendPanelProps) {
  return (
    <section id="dividend" className="scroll-mt-24 border border-slate-200 bg-white p-5">
      <h2 className="text-xl font-semibold tracking-normal text-slate-950">
        分红送配
      </h2>
      {dividends.length === 0 ? (
        <div className="mt-4 border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
          暂无数据
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="border border-slate-200 px-3 py-2 font-medium">权益登记日</th>
                <th className="border border-slate-200 px-3 py-2 font-medium">除息日</th>
                <th className="border border-slate-200 px-3 py-2 font-medium">每份分红</th>
              </tr>
            </thead>
            <tbody>
              {dividends.map((item, index) => (
                <tr key={`${item.registrationDate}-${index}`}>
                  <td className="border border-slate-200 px-3 py-2">
                    {formatText(item.registrationDate)}
                  </td>
                  <td className="border border-slate-200 px-3 py-2">
                    {formatText(item.exDividendDate)}
                  </td>
                  <td className="border border-slate-200 px-3 py-2">
                    {formatText(item.dividendPerShare)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
