import type { FundDetail } from "@/lib/fund-provider";
import { formatPercent, formatText } from "./format";

type FundTopHoldingsProps = {
  stocks: FundDetail["topStocks"];
  bonds: FundDetail["topBonds"];
};

export function FundTopHoldings({ stocks, bonds }: FundTopHoldingsProps) {
  return (
    <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="border border-slate-200 bg-white p-5">
        <h2 className="text-xl font-semibold tracking-normal text-slate-950">
          重仓持股
        </h2>
        {stocks.length === 0 ? (
          <div className="mt-4 border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
            暂无数据
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="border border-slate-200 px-3 py-2 font-medium">股票名称</th>
                  <th className="border border-slate-200 px-3 py-2 font-medium">股票代码</th>
                  <th className="border border-slate-200 px-3 py-2 font-medium">持仓占比</th>
                  <th className="border border-slate-200 px-3 py-2 font-medium">持仓市值</th>
                  <th className="border border-slate-200 px-3 py-2 font-medium">涨跌幅</th>
                </tr>
              </thead>
              <tbody>
                {stocks.map((stock) => (
                  <tr key={`${stock.code}-${stock.name}`}>
                    <td className="border border-slate-200 px-3 py-2 font-medium text-slate-950">
                      {stock.name}
                    </td>
                    <td className="border border-slate-200 px-3 py-2">{formatText(stock.code)}</td>
                    <td className="border border-slate-200 px-3 py-2">{formatPercent(stock.ratio)}</td>
                    <td className="border border-slate-200 px-3 py-2">{formatText(stock.marketValue)}</td>
                    <td className="border border-slate-200 px-3 py-2">{formatPercent(stock.change)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="border border-slate-200 bg-white p-5">
        <h2 className="text-xl font-semibold tracking-normal text-slate-950">
          重仓债券
        </h2>
        {bonds.length === 0 ? (
          <div className="mt-4 border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
            暂无数据
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[360px] border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="border border-slate-200 px-3 py-2 font-medium">债券名称</th>
                  <th className="border border-slate-200 px-3 py-2 font-medium">持仓占比</th>
                </tr>
              </thead>
              <tbody>
                {bonds.map((bond) => (
                  <tr key={bond.name}>
                    <td className="border border-slate-200 px-3 py-2">{bond.name}</td>
                    <td className="border border-slate-200 px-3 py-2">{formatPercent(bond.ratio)}</td>
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
