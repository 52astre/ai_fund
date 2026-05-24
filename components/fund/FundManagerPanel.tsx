import type { FundDetail } from "@/lib/fund-provider";
import { formatPercent, formatText } from "./format";

type FundManagerPanelProps = {
  managers: FundDetail["managers"];
};

export function FundManagerPanel({ managers }: FundManagerPanelProps) {
  return (
    <section className="border border-slate-200 bg-white p-5">
      <h2 className="text-xl font-semibold tracking-normal text-slate-950">
        基金经理信息
      </h2>
      {managers.length === 0 ? (
        <div className="mt-4 border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
          暂无数据
        </div>
      ) : (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {managers.map((manager) => (
            <article key={manager.name} className="border border-slate-200 p-4">
              <h3 className="text-lg font-semibold tracking-normal text-slate-950">
                {manager.name}
              </h3>
              <dl className="mt-3 grid gap-3 sm:grid-cols-3">
                <div>
                  <dt className="text-sm text-slate-500">任职时间</dt>
                  <dd className="mt-1 text-sm font-medium text-slate-950">
                    {formatText(manager.tenure)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">任职回报</dt>
                  <dd className="mt-1 text-sm font-medium text-slate-950">
                    {formatPercent(manager.returnDuringTenure)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">管理基金数量</dt>
                  <dd className="mt-1 text-sm font-medium text-slate-950">
                    {manager.fundCount ?? "暂无数据"}
                  </dd>
                </div>
              </dl>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                {formatText(manager.bio)}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
