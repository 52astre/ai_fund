import type { FundDetail } from "@/lib/fund-provider";
import { formatText } from "./format";

type FundArchiveProps = {
  archive: FundDetail["fundArchive"];
};

export function FundArchive({ archive }: FundArchiveProps) {
  const items = [
    { label: "基金全称", value: archive.fullName },
    { label: "基金简称", value: archive.shortName },
    { label: "基金代码", value: archive.code },
    { label: "基金类型", value: archive.type },
    { label: "发行日期", value: archive.issueDate },
    { label: "成立日期", value: archive.establishDate },
    { label: "资产规模", value: archive.assetScale },
    { label: "基金管理人", value: archive.manager },
    { label: "基金托管人", value: archive.custodian },
    { label: "基金经理", value: archive.fundManagers },
    { label: "管理费率", value: archive.managementFee },
    { label: "托管费率", value: archive.custodianFee },
    { label: "销售服务费率", value: archive.salesServiceFee },
    { label: "最高申购费率", value: archive.maxPurchaseFee },
    { label: "最高赎回费率", value: archive.maxRedemptionFee },
  ];

  return (
    <section id="archive" className="scroll-mt-24 border border-slate-200 bg-white p-5">
      <h2 className="text-xl font-semibold tracking-normal text-slate-950">
        基金档案
      </h2>
      <dl className="mt-4 grid border border-slate-200 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <div
            key={item.label}
            className={`border-b border-slate-200 px-4 py-3 ${
              index % 3 !== 2 ? "lg:border-r" : ""
            } ${index % 2 === 0 ? "sm:border-r lg:border-r" : "sm:border-r-0"}`}
          >
            <dt className="text-sm text-slate-500">{item.label}</dt>
            <dd className="mt-1 text-sm font-medium text-slate-950">
              {formatText(item.value)}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
