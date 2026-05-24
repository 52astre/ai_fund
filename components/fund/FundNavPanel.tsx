"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { FundNavPoint } from "@/lib/fund-provider";
import { formatNav, formatPercent } from "./format";

type FundNavPanelProps = {
  navHistory: FundNavPoint[];
};

const rangeOptions = [
  { label: "近1月", days: 31 },
  { label: "近3月", days: 93 },
  { label: "近6月", days: 186 },
  { label: "近1年", days: 366 },
  { label: "近3年", days: 366 * 3 },
  { label: "全部", days: null },
];

export function FundNavPanel({ navHistory }: FundNavPanelProps) {
  const [activeRange, setActiveRange] = useState("近6月");
  const chartData = useMemo(() => {
    const selectedRange = rangeOptions.find((item) => item.label === activeRange);
    const sortedHistory = [...navHistory].sort((left, right) =>
      left.navDate.localeCompare(right.navDate),
    );

    if (!selectedRange?.days || sortedHistory.length === 0) {
      return sortedHistory;
    }

    const latestDate = new Date(sortedHistory.at(-1)?.navDate ?? "");
    const startTime = latestDate.getTime() - selectedRange.days * 24 * 60 * 60 * 1000;

    return sortedHistory.filter((item) => new Date(item.navDate).getTime() >= startTime);
  }, [activeRange, navHistory]);

  return (
    <section id="nav" className="scroll-mt-24 border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-normal text-slate-950">
            净值走势图
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            单位净值走势与累计净值走势
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {rangeOptions.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => setActiveRange(item.label)}
              className={`min-h-9 border px-3 text-sm font-medium transition ${
                activeRange === item.label
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:border-slate-500"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="mt-5 flex h-80 items-center justify-center border border-dashed border-slate-300 text-sm text-slate-500">
          暂无数据
        </div>
      ) : (
        <div className="mt-5 h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 20, bottom: 8, left: 0 }}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
              <XAxis
                dataKey="navDate"
                tickFormatter={(value: string) => value.slice(5)}
                tick={{ fill: "#64748b", fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#cbd5e1" }}
              />
              <YAxis
                domain={["dataMin", "dataMax"]}
                tick={{ fill: "#64748b", fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#cbd5e1" }}
                width={48}
              />
              <Tooltip
                formatter={(value, name) => [
                  formatNav(Number(value)),
                  name === "unitNav" ? "单位净值" : "累计净值",
                ]}
                labelFormatter={(label) => `日期：${label}`}
                contentStyle={{
                  borderColor: "#cbd5e1",
                  color: "#0f172a",
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="unitNav"
                name="单位净值"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="accumulatedNav"
                name="累计净值"
                stroke="#dc2626"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="border border-slate-200 px-3 py-2 font-medium">日期</th>
              <th className="border border-slate-200 px-3 py-2 font-medium">单位净值</th>
              <th className="border border-slate-200 px-3 py-2 font-medium">累计净值</th>
              <th className="border border-slate-200 px-3 py-2 font-medium">日涨跌幅</th>
            </tr>
          </thead>
          <tbody>
            {[...navHistory]
              .sort((left, right) => right.navDate.localeCompare(left.navDate))
              .slice(0, 20)
              .map((item) => (
                <tr key={item.navDate} className="bg-white">
                  <td className="border border-slate-200 px-3 py-2">{item.navDate}</td>
                  <td className="border border-slate-200 px-3 py-2">{formatNav(item.unitNav)}</td>
                  <td className="border border-slate-200 px-3 py-2">{formatNav(item.accumulatedNav)}</td>
                  <td className="border border-slate-200 px-3 py-2">{formatPercent(item.dailyReturn)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
