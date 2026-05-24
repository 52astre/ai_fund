import type { FundDetail } from "@/lib/fund-provider";
import { formatText } from "./format";

type FundFeePanelProps = {
  fees: FundDetail["fees"];
};

export function FundFeePanel({ fees }: FundFeePanelProps) {
  const items = [
    { label: "申购费", value: fees.purchaseFee },
    { label: "赎回费", value: fees.redemptionFee },
    { label: "管理费", value: fees.managementFee },
    { label: "托管费", value: fees.custodianFee },
    { label: "销售服务费", value: fees.salesServiceFee },
  ];

  return (
    <section id="fees" className="scroll-mt-24 border border-slate-200 bg-white p-5">
      <h2 className="text-xl font-semibold tracking-normal text-slate-950">
        费率结构
      </h2>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {items.map((item) => (
          <div key={item.label} className="border border-slate-200 p-4">
            <dt className="text-sm text-slate-500">{item.label}</dt>
            <dd className="mt-2 text-lg font-semibold tracking-normal text-slate-950">
              {formatText(item.value)}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
