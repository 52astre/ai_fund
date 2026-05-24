"use client";

import { FundNavPanel } from "@/components/fund/FundNavPanel";
import type { FundNavPoint } from "@/lib/fund-provider";

type FundNavChartProps = {
  navHistory: FundNavPoint[];
};

export function FundNavChart({ navHistory }: FundNavChartProps) {
  return <FundNavPanel navHistory={navHistory} />;
}
