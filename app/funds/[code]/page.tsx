import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { disclaimer, fundProvider } from "@/lib/fund-provider";

const routeParamsSchema = z.object({
  code: z.string().regex(/^\d{6}$/),
});

type FundDetailPageProps = {
  params: Promise<{
    code?: string;
  }>;
};

export default async function FundDetailPage({ params }: FundDetailPageProps) {
  const parsedParams = routeParamsSchema.safeParse(await params);

  if (!parsedParams.success) {
    notFound();
  }

  const fund = await fundProvider
    .getFundInfo(parsedParams.data.code)
    .catch(() => notFound());

  const details = [
    { label: "基金代码", value: fund.code },
    { label: "基金名称", value: fund.name },
    { label: "基金类型", value: fund.type },
    { label: "基金规模", value: fund.fundSize },
    { label: "风险等级", value: fund.riskLevel },
    { label: "基金公司", value: fund.company },
    { label: "基金经理", value: fund.manager },
    { label: "成立日期", value: fund.inceptionDate },
    { label: "数据来源", value: fund.source },
  ];

  return (
    <main className="min-h-screen px-6 py-10">
      <section className="mx-auto max-w-4xl">
        <Link
          href="/funds"
          className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
        >
          返回基金搜索
        </Link>

        <div className="mt-6">
          <p className="text-sm font-medium text-slate-500">基金详情</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">
            {fund.name}
          </h1>
          <p className="mt-4 max-w-2xl text-slate-600">
            本页通过统一基金数据 Provider 获取基础信息，仅用于个人分析查看。
          </p>
        </div>

        <dl className="mt-8 grid overflow-hidden border border-slate-200 bg-white sm:grid-cols-2">
          {details.map((item, index) => (
            <div
              key={item.label}
              className={`border-b border-slate-200 px-4 py-4 ${
                index % 2 === 0 ? "sm:border-r" : ""
              }`}
            >
              <dt className="text-sm text-slate-500">{item.label}</dt>
              <dd className="mt-2 text-base font-medium text-slate-950">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-6 border-l-4 border-amber-500 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
          {disclaimer}
        </p>
      </section>
    </main>
  );
}
