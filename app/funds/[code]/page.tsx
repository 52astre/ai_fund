import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { FundArchive } from "@/components/fund/FundArchive";
import { FundAssetAllocation } from "@/components/fund/FundAssetAllocation";
import { FundDividendPanel } from "@/components/fund/FundDividendPanel";
import { FundFeePanel } from "@/components/fund/FundFeePanel";
import { FundManagerPanel } from "@/components/fund/FundManagerPanel";
import { FundNavPanel } from "@/components/fund/FundNavPanel";
import { FundOverview } from "@/components/fund/FundOverview";
import { FundPerformanceTable } from "@/components/fund/FundPerformanceTable";
import { FundRiskNotice } from "@/components/fund/FundRiskNotice";
import { FundTopHoldings } from "@/components/fund/FundTopHoldings";
import { formatPercent, getReturnClassName } from "@/components/fund/format";
import { fundProvider } from "@/lib/fund-provider";
import { getHoldingViewByFundCode } from "@/lib/holdings";

const routeParamsSchema = z.object({
  code: z.string().regex(/^\d{6}$/),
});

type FundDetailPageProps = {
  params: Promise<{
    code?: string;
  }>;
};

const navItems = [
  { label: "概况", href: "#overview" },
  { label: "净值", href: "#nav" },
  { label: "阶段涨幅", href: "#performance" },
  { label: "档案", href: "#archive" },
  { label: "持仓", href: "#holding" },
  { label: "费率", href: "#fees" },
  { label: "分红", href: "#dividend" },
  { label: "风险提示", href: "#risk" },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

export default async function FundDetailPage({ params }: FundDetailPageProps) {
  const parsedParams = routeParamsSchema.safeParse(await params);

  if (!parsedParams.success) {
    notFound();
  }

  const [fund, holding] = await Promise.all([
    fundProvider.getFundDetail(parsedParams.data.code),
    getHoldingViewByFundCode(parsedParams.data.code),
  ]).catch(() => notFound());

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:py-8">
      <section className="mx-auto max-w-7xl">
        <div className="mb-4 flex items-center justify-between gap-4">
          <Link
            href="/"
            aria-label="返回首页"
            className="inline-flex h-11 w-11 items-center justify-center border border-slate-300 bg-white text-xl font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-950"
          >
            ←
          </Link>
          <Link
            href="/funds"
            className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
          >
            返回基金搜索
          </Link>
        </div>

        <nav className="sticky top-0 z-10 mb-5 overflow-x-auto border border-slate-200 bg-white/95 px-3 py-3 backdrop-blur">
          <div className="flex min-w-max gap-2">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="inline-flex min-h-9 items-center border border-slate-200 px-3 text-sm font-medium text-slate-700 transition hover:border-slate-500 hover:text-slate-950"
              >
                {item.label}
              </a>
            ))}
          </div>
        </nav>

        {process.env.NODE_ENV !== "production" ? (
          <div className="mb-5 border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
            开发诊断：
            <Link
              href={`/api/funds/${fund.code}/diagnostics`}
              className="ml-2 font-medium underline underline-offset-4"
            >
              查看基金数据链路
            </Link>
          </div>
        ) : null}

        <div className="space-y-5">
          <FundOverview fund={fund} />

          <FundNavPanel navHistory={fund.navHistory} />

          <FundPerformanceTable rows={fund.stagePerformance} />

          <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
            <FundArchive archive={fund.fundArchive} />
            <FundManagerPanel managers={fund.managers} />
          </div>

          <FundAssetAllocation
            allocation={fund.assetAllocation}
            industries={fund.industryAllocation}
          />

          <FundTopHoldings stocks={fund.topStocks} bonds={fund.topBonds} />

          <section className="border border-slate-200 bg-white p-5">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <h2 className="text-xl font-semibold tracking-normal text-slate-950">
                  持仓联动
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  基于本地持仓记录与最新单位净值估算，用于后续个人分析。
                </p>
              </div>
              <Link
                href={holding ? `/analysis?holdingId=${holding.id}` : "/holdings"}
                className="inline-flex min-h-11 items-center justify-center bg-slate-950 px-5 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                {holding ? "进入持仓分析" : "新增持仓"}
              </Link>
            </div>

            {holding ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="border border-slate-200 px-4 py-4">
                  <p className="text-sm text-slate-500">是否持仓</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    已持仓
                  </p>
                </div>
                <div className="border border-slate-200 px-4 py-4">
                  <p className="text-sm text-slate-500">持仓金额</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    {formatCurrency(holding.holdingAmount)}
                  </p>
                </div>
                <div className="border border-slate-200 px-4 py-4">
                  <p className="text-sm text-slate-500">当前收益</p>
                  <p
                    className={`mt-2 text-lg font-semibold ${getReturnClassName(
                      holding.currentReturn,
                    )}`}
                  >
                    {formatCurrency(holding.currentReturn)}
                  </p>
                </div>
                <div className="border border-slate-200 px-4 py-4">
                  <p className="text-sm text-slate-500">总收益率</p>
                  <p
                    className={`mt-2 text-lg font-semibold ${getReturnClassName(
                      holding.totalReturnRate,
                    )}`}
                  >
                    {formatPercent(holding.totalReturnRate)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-5 border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
                当前基金尚未记录本地持仓，可先新增持仓后再进行持仓维度分析。
              </div>
            )}
          </section>

          <FundFeePanel fees={fund.fees} />

          <FundDividendPanel dividends={fund.dividends} />

          <FundRiskNotice fund={fund} />
        </div>
      </section>
    </main>
  );
}
