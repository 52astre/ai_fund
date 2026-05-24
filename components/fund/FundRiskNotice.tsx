import type { FundDetail } from "@/lib/fund-provider";
import { formatSource } from "./format";

type FundRiskNoticeProps = {
  fund: FundDetail;
};

export function FundRiskNotice({ fund }: FundRiskNoticeProps) {
  const notices = [
    formatSource(fund.isMock),
    "第三方数据接口可能存在延迟、字段缺失或临时不可用，缺失字段已统一显示为“暂无数据”。",
    "净值、估值、持仓、费率与分红信息以基金公司正式公告为准。",
    "本页面不构成投资建议，仅供个人分析参考。",
  ];

  return (
    <section id="risk" className="scroll-mt-24 border border-amber-200 bg-amber-50 p-5">
      <h2 className="text-xl font-semibold tracking-normal text-amber-950">
        风险提示
      </h2>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-amber-900">
        {notices.map((notice) => (
          <li key={notice}>{notice}</li>
        ))}
      </ul>
    </section>
  );
}
