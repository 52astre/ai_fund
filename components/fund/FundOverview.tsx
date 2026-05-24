import type { FundDetail } from "@/lib/fund-provider";
import {
  formatDate,
  formatNav,
  formatPercent,
  formatSource,
  formatText,
  getReturnClassName,
} from "./format";

type FundOverviewProps = {
  fund: FundDetail;
};

const overviewItems = (fund: FundDetail) => [
  { label: "基金代码", value: fund.code },
  { label: "基金类型", value: formatText(fund.type) },
  { label: "风险等级", value: formatText(fund.riskLevel) },
  { label: "基金经理", value: formatText(fund.manager) },
  { label: "基金公司", value: formatText(fund.fundCompany) },
  { label: "基金规模", value: formatText(fund.scale) },
  { label: "成立日期", value: formatDate(fund.establishDate) },
  { label: "数据来源", value: fund.isMock ? "模拟数据" : "天天基金 / 东方财富" },
  { label: "更新时间", value: new Date(fund.updatedAt).toLocaleString("zh-CN") },
];

const performanceItems = (fund: FundDetail) => [
  { label: "日涨跌幅", value: fund.dailyChange },
  { label: "近1周", value: fund.performance.oneWeek },
  { label: "近1月", value: fund.performance.oneMonth },
  { label: "近3月", value: fund.performance.threeMonths },
  { label: "近6月", value: fund.performance.sixMonths },
  { label: "近1年", value: fund.performance.oneYear },
  { label: "近3年", value: fund.performance.threeYears },
  { label: "今年以来", value: fund.performance.yearToDate },
  { label: "成立以来", value: fund.performance.sinceInception },
];

export function FundOverview({ fund }: FundOverviewProps) {
  return (
    <section id="overview" className="scroll-mt-24">
      <div className="border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">基金详情</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950 sm:text-3xl">
              {fund.name}
            </h1>
            <p className="mt-3 text-sm text-slate-500">
              {formatText(fund.fullName)}
            </p>
            <p
              className={`mt-4 inline-flex border px-3 py-2 text-sm font-medium ${
                fund.isMock
                  ? "border-amber-200 bg-amber-50 text-amber-900"
                  : "border-emerald-200 bg-emerald-50 text-emerald-800"
              }`}
            >
              {formatSource(fund.isMock)}
            </p>
          </div>

          <div className="grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="border border-slate-200 px-4 py-3">
              <p className="text-sm text-slate-500">最新单位净值</p>
              <p className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">
                {formatNav(fund.nav)}
              </p>
            </div>
            <div className="border border-slate-200 px-4 py-3">
              <p className="text-sm text-slate-500">最新累计净值</p>
              <p className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">
                {formatNav(fund.accumulatedNav)}
              </p>
            </div>
            <div className="border border-slate-200 px-4 py-3">
              <p className="text-sm text-slate-500">净值日期</p>
              <p className="mt-2 text-lg font-semibold tracking-normal text-slate-950">
                {formatDate(fund.navDate)}
              </p>
            </div>
          </div>
        </div>

        <dl className="mt-6 grid border border-slate-200 sm:grid-cols-2 lg:grid-cols-3">
          {overviewItems(fund).map((item, index) => (
            <div
              key={item.label}
              className={`border-b border-slate-200 px-4 py-3 ${
                index % 3 !== 2 ? "lg:border-r" : ""
              } ${index % 2 === 0 ? "sm:border-r lg:border-r" : "sm:border-r-0"}`}
            >
              <dt className="text-sm text-slate-500">{item.label}</dt>
              <dd className="mt-1 text-sm font-medium text-slate-950">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {performanceItems(fund).map((item) => (
          <div key={item.label} className="border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p
              className={`mt-2 text-xl font-semibold tracking-normal ${getReturnClassName(
                item.value,
              )}`}
            >
              {formatPercent(item.value)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
