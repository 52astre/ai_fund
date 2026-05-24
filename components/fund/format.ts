const unavailableText = "暂无数据";

export const formatText = (value?: string | null) => value || unavailableText;

export const formatDate = (value?: string | null) => value || unavailableText;

export const formatNav = (value?: number | null) =>
  value === null || value === undefined ? unavailableText : value.toFixed(4);

export const formatPercent = (value?: number | null) =>
  value === null || value === undefined ? unavailableText : `${(value * 100).toFixed(2)}%`;

export const getReturnClassName = (value?: number | null) => {
  if (value === null || value === undefined) {
    return "text-slate-500";
  }

  if (value > 0) {
    return "text-red-600";
  }

  if (value < 0) {
    return "text-emerald-600";
  }

  return "text-slate-950";
};

export const formatSource = (isMock: boolean) =>
  isMock
    ? "当前为模拟数据，未成功获取互联网基金数据。"
    : "数据来源：天天基金 / 东方财富";
