import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { connect as tlsConnect } from "node:tls";
import { URL } from "node:url";
import { z } from "zod";

export const unavailableText = "暂无数据";
export const disclaimer = "不构成投资建议，仅供个人分析参考";

const fundCodeSchema = z.string().regex(/^\d{6}$/, "基金代码必须是 6 位数字");
const keywordSchema = z.string().trim().max(50, "搜索关键词不能超过 50 个字符");
const providerSourceSchema = z.enum(["eastmoney", "mock"]);
const metadataSchema = z.object({
  source: providerSourceSchema,
  isMock: z.boolean(),
  updatedAt: z.string().datetime(),
});

const nullableStringSchema = z.string().nullable();
const nullableNumberSchema = z.number().nullable();

export const fundSearchResultSchema = z
  .object({
    code: fundCodeSchema,
    name: z.string().min(1),
    type: z.string().min(1),
    fundSize: z.string().min(1),
    riskLevel: z.string().min(1),
  })
  .merge(metadataSchema);

export const fundNavPointSchema = z
  .object({
    code: fundCodeSchema,
    navDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    unitNav: z.number().positive(),
    accumulatedNav: z.number().positive().nullable(),
    dailyReturn: z.number().nullable(),
  })
  .merge(metadataSchema);

export const fundPerformanceSchema = z
  .object({
    code: fundCodeSchema,
    recentOneMonthReturn: nullableNumberSchema,
    recentThreeMonthReturn: nullableNumberSchema,
    recentSixMonthReturn: nullableNumberSchema,
    recentOneYearReturn: nullableNumberSchema,
    maxDrawdown: nullableNumberSchema,
    volatility: nullableNumberSchema,
    disclaimer: z.literal(disclaimer),
  })
  .merge(metadataSchema);

export const fundInfoSchema = fundSearchResultSchema.extend({
  manager: z.string().min(1),
  company: z.string().min(1),
  trackingIndex: nullableStringSchema,
  inceptionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  currency: z.literal("CNY"),
  latestUnitNav: nullableNumberSchema,
  latestNavDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  disclaimer: z.literal(disclaimer),
});

const performanceRangeSchema = z.object({
  oneWeek: nullableNumberSchema,
  oneMonth: nullableNumberSchema,
  threeMonths: nullableNumberSchema,
  sixMonths: nullableNumberSchema,
  oneYear: nullableNumberSchema,
  twoYears: nullableNumberSchema,
  threeYears: nullableNumberSchema,
  yearToDate: nullableNumberSchema,
  sinceInception: nullableNumberSchema,
});

const stagePerformanceRowSchema = z.object({
  label: z.string(),
  fund: nullableNumberSchema,
  peerAverage: nullableNumberSchema,
  hs300: nullableNumberSchema,
});

const fundArchiveSchema = z.object({
  fullName: nullableStringSchema,
  shortName: nullableStringSchema,
  code: fundCodeSchema,
  type: nullableStringSchema,
  issueDate: nullableStringSchema,
  establishDate: nullableStringSchema,
  assetScale: nullableStringSchema,
  manager: nullableStringSchema,
  custodian: nullableStringSchema,
  fundManagers: nullableStringSchema,
  managementFee: nullableStringSchema,
  custodianFee: nullableStringSchema,
  salesServiceFee: nullableStringSchema,
  maxPurchaseFee: nullableStringSchema,
  maxRedemptionFee: nullableStringSchema,
});

const fundManagerSchema = z.object({
  name: z.string(),
  tenure: nullableStringSchema,
  returnDuringTenure: nullableNumberSchema,
  fundCount: nullableNumberSchema,
  bio: nullableStringSchema,
});

const assetAllocationSchema = z.object({
  stock: nullableNumberSchema,
  bond: nullableNumberSchema,
  cash: nullableNumberSchema,
  other: nullableNumberSchema,
});

const industryAllocationSchema = z.object({
  industry: z.string(),
  ratio: nullableNumberSchema,
  change: nullableNumberSchema,
});

const topStockSchema = z.object({
  name: z.string(),
  code: nullableStringSchema,
  ratio: nullableNumberSchema,
  marketValue: nullableStringSchema,
  change: nullableNumberSchema,
});

const topBondSchema = z.object({
  name: z.string(),
  ratio: nullableNumberSchema,
});

const dividendSchema = z.object({
  registrationDate: nullableStringSchema,
  exDividendDate: nullableStringSchema,
  dividendPerShare: nullableStringSchema,
});

const feeSchema = z.object({
  purchaseFee: nullableStringSchema,
  redemptionFee: nullableStringSchema,
  managementFee: nullableStringSchema,
  custodianFee: nullableStringSchema,
  salesServiceFee: nullableStringSchema,
});

export const fundDetailSchema = z
  .object({
    code: fundCodeSchema,
    name: z.string().min(1),
    fullName: nullableStringSchema,
    type: nullableStringSchema,
    riskLevel: nullableStringSchema,
    manager: nullableStringSchema,
    fundCompany: nullableStringSchema,
    custodian: nullableStringSchema,
    scale: nullableStringSchema,
    establishDate: nullableStringSchema,
    issueDate: nullableStringSchema,
    nav: nullableNumberSchema,
    accumulatedNav: nullableNumberSchema,
    navDate: nullableStringSchema,
    dailyChange: nullableNumberSchema,
    performance: performanceRangeSchema,
    navHistory: z.array(fundNavPointSchema),
    stagePerformance: z.array(stagePerformanceRowSchema),
    fundArchive: fundArchiveSchema,
    managers: z.array(fundManagerSchema),
    assetAllocation: assetAllocationSchema,
    industryAllocation: z.array(industryAllocationSchema),
    topStocks: z.array(topStockSchema),
    topBonds: z.array(topBondSchema),
    dividends: z.array(dividendSchema),
    fees: feeSchema,
    disclaimer: z.literal(disclaimer),
  })
  .merge(metadataSchema);

export type ProviderSource = z.infer<typeof providerSourceSchema>;
export type FundSearchResult = z.infer<typeof fundSearchResultSchema>;
export type FundInfo = z.infer<typeof fundInfoSchema>;
export type FundNavPoint = z.infer<typeof fundNavPointSchema>;
export type FundPerformance = z.infer<typeof fundPerformanceSchema>;
export type FundDetail = z.infer<typeof fundDetailSchema>;

export interface FundProvider {
  searchFunds(keyword: string): Promise<FundSearchResult[]>;
  getFundInfo(code: string): Promise<FundInfo>;
  getFundNavHistory(code: string): Promise<FundNavPoint[]>;
  getFundPerformance(code: string): Promise<FundPerformance>;
  getFundDetail(code: string): Promise<FundDetail>;
}

type FetchLike = typeof fetch;
type ProviderMetadata = z.infer<typeof metadataSchema>;
type PerformanceRange = z.infer<typeof performanceRangeSchema>;
type StagePerformanceRow = z.infer<typeof stagePerformanceRowSchema>;
export type FundProviderDiagnostics = {
  provider: "eastmoney";
  code: string;
  proxyConfigured: boolean;
  requests: Array<{
    name: string;
    url: string;
    ok: boolean;
    error: string | null;
    parse: Record<string, string | number | boolean | null>;
  }>;
  parse: {
    coreSignals: string[];
    errors: string[];
  };
  eastMoneySuccess: boolean;
  fallbackReason: string | null;
  finalSource: ProviderSource | null;
  finalIsMock: boolean | null;
  updatedAt: string;
};

const eastMoneyMetadata = (): ProviderMetadata => ({
  source: "eastmoney",
  isMock: false,
  updatedAt: new Date().toISOString(),
});

const mockMetadata = (): ProviderMetadata => ({
  source: "mock",
  isMock: true,
  updatedAt: new Date().toISOString(),
});

const devLog = (message: string, payload?: Record<string, unknown>) => {
  const shouldLog =
    process.env.NODE_ENV !== "production" &&
    (process.env.NODE_ENV !== "test" || process.env.FUND_DEBUG === "true");

  if (shouldLog) {
    console.info(`[fund-provider] ${message}`, payload ?? {});
  }
};

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const toDisplayText = (value?: string | null) => value?.trim() || unavailableText;
const toNullableText = (value?: string | null) => value?.trim() || null;

const toNumberOrNull = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.replace(/,/g, "").replace(/%/g, "").trim();
  if (!normalizedValue || normalizedValue === "--") {
    return null;
  }

  const parsedValue = Number(normalizedValue);

  return Number.isFinite(parsedValue) ? parsedValue : null;
};

const percentToDecimal = (value: unknown): number | null => {
  const parsedValue = toNumberOrNull(value);

  return parsedValue === null ? null : parsedValue / 100;
};

const normalizeDate = (value?: string | null): string | null => {
  if (!value) {
    return null;
  }

  const matchedDate = value.match(/\d{4}[-/]\d{1,2}[-/]\d{1,2}/)?.[0];
  if (!matchedDate) {
    return null;
  }

  const [year, month, day] = matchedDate.split(/[-/]/);

  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

const timestampToDate = (value: unknown): string | null => {
  const timestamp = toNumberOrNull(value);
  if (timestamp === null) {
    return null;
  }

  return new Date(timestamp).toISOString().slice(0, 10);
};

export function parseJsonpPayload<T = unknown>(
  text: string,
  callbackName = "jsonpgz",
): T {
  const trimmedText = text.trim();
  const prefix = `${callbackName}(`;

  if (!trimmedText.startsWith(prefix) || !trimmedText.endsWith(");")) {
    throw new Error("基金最新净值 JSONP 格式不符合预期");
  }

  return JSON.parse(trimmedText.slice(prefix.length, -2)) as T;
}

const parseJsStringVariable = (script: string, name: string): string | null => {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const matchedValue = script.match(
    new RegExp(`var\\s+${escapedName}\\s*=\\s*(['"])(.*?)\\1\\s*;`),
  );

  return matchedValue?.[2] ?? null;
};

const parseJsJsonVariable = <T>(script: string, name: string): T | null => {
  const startMatch = new RegExp(`var\\s+${name}\\s*=`).exec(script);
  if (!startMatch) {
    return null;
  }

  const valueStartIndex = startMatch.index + startMatch[0].length;
  let cursor = valueStartIndex;
  while (/\s/.test(script[cursor] ?? "")) {
    cursor += 1;
  }

  const opener = script[cursor];
  const closer = opener === "[" ? "]" : opener === "{" ? "}" : null;
  if (!closer) {
    return null;
  }

  let depth = 0;
  let quote: string | null = null;
  let escaped = false;

  for (let index = cursor; index < script.length; index += 1) {
    const character = script[index];

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === quote) {
        quote = null;
      }

      continue;
    }

    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }

    if (character === opener) {
      depth += 1;
    } else if (character === closer) {
      depth -= 1;

      if (depth === 0) {
        const rawValue = script.slice(cursor, index + 1);

        try {
          return JSON.parse(rawValue) as T;
        } catch {
          return null;
        }
      }
    }
  }

  return null;
};

const stripHtml = (value: string) =>
  value
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .trim();

export function parseEastMoneyHistoryHtml(
  html: string,
  code: string,
): FundNavPoint[] {
  const rows = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)]
    .map((row) =>
      [...row[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((cell) =>
        stripHtml(cell[1]),
      ),
    )
    .filter((cells) => cells.length >= 3);

  const metadata = eastMoneyMetadata();

  return rows
    .map((cells) => {
      const navDate = normalizeDate(cells[0]);
      const unitNav = toNumberOrNull(cells[1]);

      if (!navDate || unitNav === null) {
        return null;
      }

      return {
        code,
        navDate,
        unitNav,
        accumulatedNav: toNumberOrNull(cells[2]),
        dailyReturn: percentToDecimal(cells[3]),
        ...metadata,
      };
    })
    .filter((point): point is FundNavPoint => point !== null)
    .sort((left, right) => left.navDate.localeCompare(right.navDate));
}

abstract class ValidatedFundProvider implements FundProvider {
  async searchFunds(keyword: string): Promise<FundSearchResult[]> {
    const parsedKeyword = keywordSchema.parse(keyword);

    return z.array(fundSearchResultSchema).parse(
      await this.searchFundsAdapter(parsedKeyword),
    );
  }

  async getFundInfo(code: string): Promise<FundInfo> {
    const parsedCode = fundCodeSchema.parse(code);

    return fundInfoSchema.parse(await this.getFundInfoAdapter(parsedCode));
  }

  async getFundNavHistory(code: string): Promise<FundNavPoint[]> {
    const parsedCode = fundCodeSchema.parse(code);

    return z.array(fundNavPointSchema).parse(
      await this.getFundNavHistoryAdapter(parsedCode),
    );
  }

  async getFundPerformance(code: string): Promise<FundPerformance> {
    const parsedCode = fundCodeSchema.parse(code);

    return fundPerformanceSchema.parse(
      await this.getFundPerformanceAdapter(parsedCode),
    );
  }

  async getFundDetail(code: string): Promise<FundDetail> {
    const parsedCode = fundCodeSchema.parse(code);

    return fundDetailSchema.parse(await this.getFundDetailAdapter(parsedCode));
  }

  protected abstract searchFundsAdapter(
    keyword: string,
  ): Promise<FundSearchResult[]>;

  protected abstract getFundInfoAdapter(code: string): Promise<FundInfo>;

  protected abstract getFundNavHistoryAdapter(
    code: string,
  ): Promise<FundNavPoint[]>;

  protected abstract getFundPerformanceAdapter(
    code: string,
  ): Promise<FundPerformance>;

  protected async getFundDetailAdapter(code: string): Promise<FundDetail> {
    const [info, performance, navHistory] = await Promise.all([
      this.getFundInfo(code),
      this.getFundPerformance(code),
      this.getFundNavHistory(code),
    ]);
    const latestNav = navHistory.at(-1);
    const performanceRange: PerformanceRange = {
      oneWeek: null,
      oneMonth: performance.recentOneMonthReturn,
      threeMonths: performance.recentThreeMonthReturn,
      sixMonths: performance.recentSixMonthReturn,
      oneYear: performance.recentOneYearReturn,
      twoYears: null,
      threeYears: null,
      yearToDate: null,
      sinceInception: null,
    };

    return {
      code,
      name: info.name,
      fullName: null,
      type: info.type,
      riskLevel: info.riskLevel,
      manager: info.manager,
      fundCompany: info.company,
      custodian: null,
      scale: info.fundSize,
      establishDate: info.inceptionDate,
      issueDate: null,
      nav: info.latestUnitNav ?? latestNav?.unitNav ?? null,
      accumulatedNav: latestNav?.accumulatedNav ?? null,
      navDate: info.latestNavDate ?? latestNav?.navDate ?? null,
      dailyChange: latestNav?.dailyReturn ?? null,
      performance: performanceRange,
      navHistory,
      stagePerformance: buildStagePerformance(performanceRange),
      fundArchive: {
        fullName: null,
        shortName: info.name,
        code,
        type: info.type,
        issueDate: null,
        establishDate: info.inceptionDate,
        assetScale: info.fundSize,
        manager: info.company,
        custodian: null,
        fundManagers: info.manager,
        managementFee: null,
        custodianFee: null,
        salesServiceFee: null,
        maxPurchaseFee: null,
        maxRedemptionFee: null,
      },
      managers:
        info.manager && info.manager !== unavailableText
          ? info.manager.split(/[、,，]/).map((name) => ({
              name,
              tenure: null,
              returnDuringTenure: null,
              fundCount: null,
              bio: null,
            }))
          : [],
      assetAllocation: { stock: null, bond: null, cash: null, other: null },
      industryAllocation: [],
      topStocks: [],
      topBonds: [],
      dividends: [],
      fees: {
        purchaseFee: null,
        redemptionFee: null,
        managementFee: null,
        custodianFee: null,
        salesServiceFee: null,
      },
      disclaimer,
      source: info.source,
      isMock: info.isMock,
      updatedAt: info.updatedAt,
    };
  }
}

const buildStagePerformance = (
  performance: PerformanceRange,
): StagePerformanceRow[] => [
  { label: "近1周", fund: performance.oneWeek, peerAverage: null, hs300: null },
  { label: "近1月", fund: performance.oneMonth, peerAverage: null, hs300: null },
  { label: "近3月", fund: performance.threeMonths, peerAverage: null, hs300: null },
  { label: "近6月", fund: performance.sixMonths, peerAverage: null, hs300: null },
  { label: "近1年", fund: performance.oneYear, peerAverage: null, hs300: null },
  { label: "近2年", fund: performance.twoYears, peerAverage: null, hs300: null },
  { label: "近3年", fund: performance.threeYears, peerAverage: null, hs300: null },
  { label: "今年以来", fund: performance.yearToDate, peerAverage: null, hs300: null },
  {
    label: "成立以来",
    fund: performance.sinceInception,
    peerAverage: null,
    hs300: null,
  },
];

const createMinimalMockDetail = (code: string): FundDetail => {
  const performance = {
    oneWeek: null,
    oneMonth: null,
    threeMonths: null,
    sixMonths: null,
    oneYear: null,
    twoYears: null,
    threeYears: null,
    yearToDate: null,
    sinceInception: null,
  };

  return {
    code,
    name: unavailableText,
    fullName: null,
    type: null,
    riskLevel: null,
    manager: null,
    fundCompany: null,
    custodian: null,
    scale: null,
    establishDate: null,
    issueDate: null,
    nav: null,
    accumulatedNav: null,
    navDate: null,
    dailyChange: null,
    performance,
    navHistory: [],
    stagePerformance: buildStagePerformance(performance),
    fundArchive: {
      fullName: null,
      shortName: null,
      code,
      type: null,
      issueDate: null,
      establishDate: null,
      assetScale: null,
      manager: null,
      custodian: null,
      fundManagers: null,
      managementFee: null,
      custodianFee: null,
      salesServiceFee: null,
      maxPurchaseFee: null,
      maxRedemptionFee: null,
    },
    managers: [],
    assetAllocation: { stock: null, bond: null, cash: null, other: null },
    industryAllocation: [],
    topStocks: [],
    topBonds: [],
    dividends: [],
    fees: {
      purchaseFee: null,
      redemptionFee: null,
      managementFee: null,
      custodianFee: null,
      salesServiceFee: null,
    },
    disclaimer,
    ...mockMetadata(),
  };
};

const mockFunds: FundDetail[] = [
  {
    code: "000001",
    name: "华夏成长混合",
    fullName: "华夏成长证券投资基金",
    type: "混合型",
    riskLevel: "中高风险",
    manager: "钟帅",
    fundCompany: "华夏基金管理有限公司",
    custodian: "中国建设银行股份有限公司",
    scale: "35.42 亿元",
    establishDate: "2001-12-18",
    issueDate: "2001-11-28",
    nav: 1.245,
    accumulatedNav: 3.578,
    navDate: "2026-05-21",
    dailyChange: 0.0057,
    performance: {
      oneWeek: 0.012,
      oneMonth: 0.0185,
      threeMonths: 0.032,
      sixMonths: 0.047,
      oneYear: 0.083,
      twoYears: null,
      threeYears: null,
      yearToDate: 0.041,
      sinceInception: 2.578,
    },
    navHistory: [
      {
        code: "000001",
        navDate: "2026-05-19",
        unitNav: 1.234,
        accumulatedNav: 3.556,
        dailyReturn: -0.0021,
        ...mockMetadata(),
      },
      {
        code: "000001",
        navDate: "2026-05-20",
        unitNav: 1.238,
        accumulatedNav: 3.562,
        dailyReturn: 0.0032,
        ...mockMetadata(),
      },
      {
        code: "000001",
        navDate: "2026-05-21",
        unitNav: 1.245,
        accumulatedNav: 3.578,
        dailyReturn: 0.0057,
        ...mockMetadata(),
      },
    ],
    stagePerformance: buildStagePerformance({
      oneWeek: 0.012,
      oneMonth: 0.0185,
      threeMonths: 0.032,
      sixMonths: 0.047,
      oneYear: 0.083,
      twoYears: null,
      threeYears: null,
      yearToDate: 0.041,
      sinceInception: 2.578,
    }),
    fundArchive: {
      fullName: "华夏成长证券投资基金",
      shortName: "华夏成长混合",
      code: "000001",
      type: "混合型",
      issueDate: "2001-11-28",
      establishDate: "2001-12-18",
      assetScale: "35.42 亿元",
      manager: "华夏基金管理有限公司",
      custodian: "中国建设银行股份有限公司",
      fundManagers: "钟帅",
      managementFee: "1.20%/年",
      custodianFee: "0.20%/年",
      salesServiceFee: null,
      maxPurchaseFee: "1.50%",
      maxRedemptionFee: "1.50%",
    },
    managers: [
      {
        name: "钟帅",
        tenure: "2020-07-28 至今",
        returnDuringTenure: 0.186,
        fundCount: 7,
        bio: "模拟基金经理简介，仅在互联网基金数据获取失败时展示。",
      },
    ],
    assetAllocation: { stock: 0.68, bond: 0.08, cash: 0.16, other: 0.08 },
    industryAllocation: [
      { industry: "电子", ratio: 0.185, change: null },
      { industry: "医药生物", ratio: 0.142, change: null },
    ],
    topStocks: [
      {
        name: "贵州茅台",
        code: "600519",
        ratio: 0.082,
        marketValue: "2.91 亿元",
        change: null,
      },
      {
        name: "宁德时代",
        code: "300750",
        ratio: 0.065,
        marketValue: "2.30 亿元",
        change: null,
      },
    ],
    topBonds: [{ name: "暂无模拟债券明细", ratio: null }],
    dividends: [
      {
        registrationDate: "2024-01-15",
        exDividendDate: "2024-01-16",
        dividendPerShare: "0.0200 元",
      },
    ],
    fees: {
      purchaseFee: "1.50%",
      redemptionFee: "1.50%",
      managementFee: "1.20%/年",
      custodianFee: "0.20%/年",
      salesServiceFee: null,
    },
    disclaimer,
    ...mockMetadata(),
  },
  {
    code: "510300",
    name: "沪深300指数增强",
    fullName: "沪深300指数增强型证券投资基金",
    type: "指数型",
    riskLevel: "中高风险",
    manager: "李华",
    fundCompany: "示例资产管理有限公司",
    custodian: null,
    scale: "68.20 亿元",
    establishDate: "2015-06-01",
    issueDate: null,
    nav: 4.168,
    accumulatedNav: 4.168,
    navDate: "2026-05-21",
    dailyChange: 0.0117,
    performance: {
      oneWeek: null,
      oneMonth: 0.0291,
      threeMonths: 0.061,
      sixMonths: 0.074,
      oneYear: 0.118,
      twoYears: null,
      threeYears: null,
      yearToDate: null,
      sinceInception: null,
    },
    navHistory: [
      {
        code: "510300",
        navDate: "2026-05-19",
        unitNav: 4.138,
        accumulatedNav: 4.138,
        dailyReturn: 0.0024,
        ...mockMetadata(),
      },
      {
        code: "510300",
        navDate: "2026-05-20",
        unitNav: 4.12,
        accumulatedNav: 4.12,
        dailyReturn: -0.0045,
        ...mockMetadata(),
      },
      {
        code: "510300",
        navDate: "2026-05-21",
        unitNav: 4.168,
        accumulatedNav: 4.168,
        dailyReturn: 0.0117,
        ...mockMetadata(),
      },
    ],
    stagePerformance: buildStagePerformance({
      oneWeek: null,
      oneMonth: 0.0291,
      threeMonths: 0.061,
      sixMonths: 0.074,
      oneYear: 0.118,
      twoYears: null,
      threeYears: null,
      yearToDate: null,
      sinceInception: null,
    }),
    fundArchive: {
      fullName: "沪深300指数增强型证券投资基金",
      shortName: "沪深300指数增强",
      code: "510300",
      type: "指数型",
      issueDate: null,
      establishDate: "2015-06-01",
      assetScale: "68.20 亿元",
      manager: "示例资产管理有限公司",
      custodian: null,
      fundManagers: "李华",
      managementFee: null,
      custodianFee: null,
      salesServiceFee: null,
      maxPurchaseFee: null,
      maxRedemptionFee: null,
    },
    managers: [],
    assetAllocation: { stock: null, bond: null, cash: null, other: null },
    industryAllocation: [],
    topStocks: [],
    topBonds: [],
    dividends: [],
    fees: {
      purchaseFee: null,
      redemptionFee: null,
      managementFee: null,
      custodianFee: null,
      salesServiceFee: null,
    },
    disclaimer,
    ...mockMetadata(),
  },
  {
    code: "110022",
    name: "安心债券A",
    fullName: "安心债券型证券投资基金 A",
    type: "债券型",
    riskLevel: "中低风险",
    manager: "王宁",
    fundCompany: "示例稳健基金有限公司",
    custodian: null,
    scale: "12.80 亿元",
    establishDate: "2020-01-10",
    issueDate: null,
    nav: 1.0831,
    accumulatedNav: 1.1471,
    navDate: "2026-05-21",
    dailyChange: 0.001,
    performance: {
      oneWeek: null,
      oneMonth: 0.0042,
      threeMonths: 0.009,
      sixMonths: 0.017,
      oneYear: 0.031,
      twoYears: null,
      threeYears: null,
      yearToDate: null,
      sinceInception: null,
    },
    navHistory: [
      {
        code: "110022",
        navDate: "2026-05-19",
        unitNav: 1.0811,
        accumulatedNav: 1.1451,
        dailyReturn: 0.0004,
        ...mockMetadata(),
      },
      {
        code: "110022",
        navDate: "2026-05-20",
        unitNav: 1.082,
        accumulatedNav: 1.146,
        dailyReturn: 0.0008,
        ...mockMetadata(),
      },
      {
        code: "110022",
        navDate: "2026-05-21",
        unitNav: 1.0831,
        accumulatedNav: 1.1471,
        dailyReturn: 0.001,
        ...mockMetadata(),
      },
    ],
    stagePerformance: buildStagePerformance({
      oneWeek: null,
      oneMonth: 0.0042,
      threeMonths: 0.009,
      sixMonths: 0.017,
      oneYear: 0.031,
      twoYears: null,
      threeYears: null,
      yearToDate: null,
      sinceInception: null,
    }),
    fundArchive: {
      fullName: "安心债券型证券投资基金 A",
      shortName: "安心债券A",
      code: "110022",
      type: "债券型",
      issueDate: null,
      establishDate: "2020-01-10",
      assetScale: "12.80 亿元",
      manager: "示例稳健基金有限公司",
      custodian: null,
      fundManagers: "王宁",
      managementFee: null,
      custodianFee: null,
      salesServiceFee: null,
      maxPurchaseFee: null,
      maxRedemptionFee: null,
    },
    managers: [],
    assetAllocation: { stock: null, bond: null, cash: null, other: null },
    industryAllocation: [],
    topStocks: [],
    topBonds: [],
    dividends: [],
    fees: {
      purchaseFee: null,
      redemptionFee: null,
      managementFee: null,
      custodianFee: null,
      salesServiceFee: null,
    },
    disclaimer,
    ...mockMetadata(),
  },
];

const findMockDetail = (code: string) => {
  const fund = mockFunds.find((item) => item.code === code);

  if (!fund) {
    return createMinimalMockDetail(code);
  }

  return { ...fund, ...mockMetadata() };
};

export class MockProvider extends ValidatedFundProvider {
  protected async searchFundsAdapter(
    keyword: string,
  ): Promise<FundSearchResult[]> {
    const normalizedKeyword = keyword.trim().toLowerCase();
    const matchedFunds = normalizedKeyword
      ? mockFunds.filter(
          (fund) =>
            fund.code.includes(normalizedKeyword) ||
            fund.name.toLowerCase().includes(normalizedKeyword) ||
            (fund.type ?? "").toLowerCase().includes(normalizedKeyword),
        )
      : mockFunds;

    return matchedFunds.map((fund) => ({
      code: fund.code,
      name: fund.name,
      type: fund.type ?? unavailableText,
      fundSize: fund.scale ?? unavailableText,
      riskLevel: fund.riskLevel ?? unavailableText,
      source: "mock",
      isMock: true,
      updatedAt: new Date().toISOString(),
    }));
  }

  protected async getFundInfoAdapter(code: string): Promise<FundInfo> {
    const fund = findMockDetail(code);

    return detailToInfo(fund);
  }

  protected async getFundNavHistoryAdapter(
    code: string,
  ): Promise<FundNavPoint[]> {
    return findMockDetail(code).navHistory.map((point) => ({
      ...point,
      ...mockMetadata(),
    }));
  }

  protected async getFundPerformanceAdapter(
    code: string,
  ): Promise<FundPerformance> {
    const fund = findMockDetail(code);

    return detailToPerformance(fund);
  }

  protected async getFundDetailAdapter(code: string): Promise<FundDetail> {
    return findMockDetail(code);
  }
}

type LatestNavPayload = {
  fundcode?: string;
  name?: string;
  jzrq?: string;
  dwjz?: string;
  gsz?: string;
  gztime?: string;
};

type NetWorthTrendItem = {
  x?: number;
  y?: number;
  equityReturn?: number;
};

type AccumulatedTrendItem = [number, number];

type FundManagerItem = {
  name?: string;
  power?: {
    avr?: string;
  };
};

type GrandTotalItem = {
  name?: string;
  data?: string[];
};

type AssetAllocationItem = {
  type?: string;
  name?: string;
  value?: string | number;
  ratio?: string | number;
};

type StockPositionItem = {
  GPDM?: string;
  GPJC?: string;
  JZBL?: string;
  PCTNVCHG?: string;
  NEWTEXCH?: string;
};

type EastMoneyFetchResults = {
  detailsScript: string | null;
  latestNav: LatestNavPayload | null;
  navHistory: FundNavPoint[];
  failures: string[];
  requests: FundProviderDiagnostics["requests"];
};

export class EastMoneyFundProvider extends ValidatedFundProvider {
  private readonly fetcher: FetchLike;
  private readonly timeoutMs: number;
  private readonly proxyUrl: string | null;

  constructor(
    options: { fetcher?: FetchLike; timeoutMs?: number; proxyUrl?: string | null } = {},
  ) {
    super();
    const configuredTimeout = Number(process.env.FUND_DATA_TIMEOUT_MS ?? "8000");
    this.fetcher = options.fetcher ?? fetch;
    this.timeoutMs =
      options.timeoutMs ??
      (Number.isFinite(configuredTimeout) ? configuredTimeout : 8000);
    this.proxyUrl = options.proxyUrl ?? process.env.FUND_DATA_PROXY_URL ?? null;
  }

  protected async searchFundsAdapter(
    keyword: string,
  ): Promise<FundSearchResult[]> {
    if (!/^\d{6}$/.test(keyword)) {
      throw new Error("天天基金 Provider 暂仅支持基金代码搜索");
    }

    const info = await this.getFundInfo(keyword);

    return [
      {
        code: info.code,
        name: info.name,
        type: info.type,
        fundSize: info.fundSize,
        riskLevel: info.riskLevel,
        source: info.source,
        isMock: info.isMock,
        updatedAt: info.updatedAt,
      },
    ];
  }

  protected async getFundInfoAdapter(code: string): Promise<FundInfo> {
    return detailToInfo(await this.getFundDetailAdapter(code));
  }

  protected async getFundNavHistoryAdapter(
    code: string,
  ): Promise<FundNavPoint[]> {
    return this.fetchNavHistory(code);
  }

  protected async getFundPerformanceAdapter(
    code: string,
  ): Promise<FundPerformance> {
    return detailToPerformance(await this.getFundDetailAdapter(code));
  }

  protected async getFundDetailAdapter(code: string): Promise<FundDetail> {
    devLog("EastMoney 开始获取基金详情", { provider: "eastmoney", code });

    const results = await this.fetchEastMoneyData(code);
    const detail = this.buildDetailFromEastMoney(code, results);
    const coreSignals = this.getEastMoneyCoreSignals(code, detail, results);

    if (coreSignals.length === 0) {
      const reason = `真实接口未返回核心数据：${results.failures.join("；") || "返回为空"}`;
      devLog("EastMoney 获取失败，准备 fallback", { code, reason });
      throw new Error(reason);
    }

    devLog("EastMoney 获取成功", {
      code,
      hasDetailsScript: Boolean(results.detailsScript),
      hasLatestNav: Boolean(results.latestNav),
      navHistoryCount: results.navHistory.length,
      coreSignals,
      failures: results.failures,
    });

    return fundDetailSchema.parse(detail);
  }

  async diagnose(code: string): Promise<FundProviderDiagnostics> {
    const parsedCode = fundCodeSchema.parse(code);
    const results = await this.fetchEastMoneyData(parsedCode);
    const detail = this.buildDetailFromEastMoney(parsedCode, results);
    const coreSignals = this.getEastMoneyCoreSignals(parsedCode, detail, results);
    const eastMoneySuccess = coreSignals.length > 0;
    const finalDetail = eastMoneySuccess
      ? detail
      : await new MockProvider().getFundDetail(parsedCode);
    const parseErrors = results.requests
      .filter((request) => request.ok && !request.parse.hasCoreData)
      .map((request) => `${request.name}响应格式不符合预期`);
    const fallbackReason = results.requests
      .filter((request) => !request.ok)
      .map((request) => `${request.name}失败：${request.error}`)
      .concat(parseErrors)
      .join("；");

    return {
      provider: "eastmoney",
      code: parsedCode,
      proxyConfigured: Boolean(this.proxyUrl),
      requests: results.requests,
      parse: {
        coreSignals,
        errors: parseErrors,
      },
      eastMoneySuccess,
      fallbackReason: eastMoneySuccess
        ? null
        : fallbackReason || "真实接口未返回核心数据",
      finalSource: finalDetail.source,
      finalIsMock: finalDetail.isMock,
      updatedAt: new Date().toISOString(),
    };
  }

  private async fetchEastMoneyData(code: string): Promise<EastMoneyFetchResults> {
    const detailUrl = this.getDetailUrl(code);
    const latestNavUrl = this.getLatestNavUrl(code);
    const historyUrl = this.getHistoryUrl(code, 100);
    const [detailsResult, latestNavResult, historyResult] =
      await Promise.allSettled([
        this.fetchText(detailUrl),
        this.fetchText(latestNavUrl).then((jsonp) =>
          parseJsonpPayload<LatestNavPayload>(jsonp),
        ),
        this.fetchText(historyUrl).then((html) => {
          const history = parseEastMoneyHistoryHtml(html, code);
          if (history.length === 0) {
            throw new Error("历史净值为空");
          }

          return history;
        }),
      ]);
    const failures: string[] = [];

    if (detailsResult.status === "rejected") {
      failures.push(`详情脚本失败：${errorMessage(detailsResult.reason)}`);
    }
    if (latestNavResult.status === "rejected") {
      failures.push(`最新净值失败：${errorMessage(latestNavResult.reason)}`);
    }
    if (historyResult.status === "rejected") {
      failures.push(`历史净值失败：${errorMessage(historyResult.reason)}`);
    }
    const detailsScript =
      detailsResult.status === "fulfilled" ? detailsResult.value : null;
    const latestNav =
      latestNavResult.status === "fulfilled" ? latestNavResult.value : null;
    const navHistory =
      historyResult.status === "fulfilled" ? historyResult.value : [];
    const requests: FundProviderDiagnostics["requests"] = [
      {
        name: "详情脚本",
        url: detailUrl,
        ok: detailsResult.status === "fulfilled",
        error:
          detailsResult.status === "rejected"
            ? errorMessage(detailsResult.reason)
            : null,
        parse: this.inspectDetailScript(detailsScript),
      },
      {
        name: "最新净值",
        url: latestNavUrl,
        ok: latestNavResult.status === "fulfilled",
        error:
          latestNavResult.status === "rejected"
            ? errorMessage(latestNavResult.reason)
            : null,
        parse: this.inspectLatestNav(latestNav),
      },
      {
        name: "历史净值",
        url: historyUrl,
        ok: historyResult.status === "fulfilled",
        error:
          historyResult.status === "rejected"
            ? errorMessage(historyResult.reason)
            : null,
        parse: this.inspectNavHistory(navHistory),
      },
    ];

    return {
      detailsScript,
      latestNav,
      navHistory,
      failures,
      requests,
    };
  }

  private buildDetailFromEastMoney(
    code: string,
    results: EastMoneyFetchResults,
  ): FundDetail {
    const { detailsScript, latestNav, navHistory } = results;
    const netWorthTrend = detailsScript
      ? parseJsJsonVariable<NetWorthTrendItem[]>(
          detailsScript,
          "Data_netWorthTrend",
        )
      : null;
    const accumulatedTrend = detailsScript
      ? parseJsJsonVariable<AccumulatedTrendItem[]>(
          detailsScript,
          "Data_ACWorthTrend",
        )
      : null;
    const managers = detailsScript
      ? parseJsJsonVariable<FundManagerItem[]>(
          detailsScript,
          "Data_currentFundManager",
        )
      : null;
    const grandTotal = detailsScript
      ? parseJsJsonVariable<GrandTotalItem[]>(detailsScript, "Data_grandTotal")
      : null;
    const assetAllocation = detailsScript
      ? parseJsJsonVariable<AssetAllocationItem[]>(
          detailsScript,
          "Data_assetAllocation",
        )
      : null;
    const stockPosition = detailsScript
      ? parseJsJsonVariable<StockPositionItem[]>(
          detailsScript,
          "Data_stockPosition",
        )
      : null;
    const latestTrendPoint = netWorthTrend?.at(-1);
    const latestHistoryPoint = navHistory.at(-1);
    const name = toDisplayText(
      (detailsScript ? parseJsStringVariable(detailsScript, "fS_name") : null) ??
        latestNav?.name,
    );
    const latestNavDate =
      normalizeDate(latestNav?.jzrq) ??
      latestHistoryPoint?.navDate ??
      timestampToDate(latestTrendPoint?.x);
    const unitNav =
      toNumberOrNull(latestNav?.dwjz) ??
      latestHistoryPoint?.unitNav ??
      toNumberOrNull(latestTrendPoint?.y);
    const accumulatedNav =
      latestHistoryPoint?.accumulatedNav ??
      toNumberOrNull(accumulatedTrend?.at(-1)?.[1]);
    const managerNames =
      managers?.map((manager) => manager.name).filter(Boolean).join("、") ??
      null;
    const scale = detailsScript
      ? toNullableText(parseJsStringVariable(detailsScript, "Data_fluctuationScale"))
      : null;
    const performance: PerformanceRange = {
      oneWeek: detailsScript
        ? percentToDecimal(parseJsStringVariable(detailsScript, "syl_1z"))
        : null,
      oneMonth:
        (detailsScript
          ? percentToDecimal(parseJsStringVariable(detailsScript, "syl_1y"))
          : null) ?? getReturnByName(grandTotal, "近1月"),
      threeMonths: getReturnByName(grandTotal, "近3月"),
      sixMonths: getReturnByName(grandTotal, "近6月"),
      oneYear:
        (detailsScript
          ? percentToDecimal(parseJsStringVariable(detailsScript, "syl_1n"))
          : null) ?? getReturnByName(grandTotal, "近1年"),
      twoYears: getReturnByName(grandTotal, "近2年"),
      threeYears: getReturnByName(grandTotal, "近3年"),
      yearToDate: getReturnByName(grandTotal, "今年来"),
      sinceInception: getReturnByName(grandTotal, "成立来"),
    };

    return {
      code,
      name,
      fullName: null,
      type: null,
      riskLevel: null,
      manager: toNullableText(managerNames),
      fundCompany: null,
      custodian: null,
      scale,
      establishDate: null,
      issueDate: null,
      nav: unitNav,
      accumulatedNav,
      navDate: latestNavDate,
      dailyChange:
        latestHistoryPoint?.dailyReturn ??
        percentToDecimal(latestTrendPoint?.equityReturn),
      performance,
      navHistory,
      stagePerformance: buildStagePerformance(performance),
      fundArchive: {
        fullName: null,
        shortName: name,
        code,
        type: null,
        issueDate: null,
        establishDate: null,
        assetScale: scale,
        manager: null,
        custodian: null,
        fundManagers: toNullableText(managerNames),
        managementFee: null,
        custodianFee: null,
        salesServiceFee: null,
        maxPurchaseFee: null,
        maxRedemptionFee: null,
      },
      managers:
        managers
          ?.map((manager) => ({
            name: manager.name ?? "",
            tenure: null,
            returnDuringTenure: percentToDecimal(manager.power?.avr),
            fundCount: null,
            bio: null,
          }))
          .filter((manager) => manager.name) ?? [],
      assetAllocation: parseAssetAllocation(assetAllocation),
      industryAllocation: [],
      topStocks:
        stockPosition?.map((stock) => ({
          name: stock.GPJC ?? unavailableText,
          code: stock.GPDM ?? null,
          ratio: percentToDecimal(stock.JZBL),
          marketValue: stock.NEWTEXCH ?? null,
          change: percentToDecimal(stock.PCTNVCHG),
        })) ?? [],
      topBonds: [],
      dividends: [],
      fees: {
        purchaseFee: null,
        redemptionFee: null,
        managementFee: null,
        custodianFee: null,
        salesServiceFee: null,
      },
      disclaimer,
      ...eastMoneyMetadata(),
    };
  }

  private getEastMoneyCoreSignals(
    code: string,
    detail: FundDetail,
    results: EastMoneyFetchResults,
  ) {
    const scriptCode = results.detailsScript
      ? parseJsStringVariable(results.detailsScript, "fS_code")
      : null;
    const signals: string[] = [];

    if (scriptCode === code) {
      signals.push("detail.code");
    }
    if (results.latestNav?.fundcode === code) {
      signals.push("jsonp.code");
    }
    if (results.latestNav?.name || detail.name !== unavailableText) {
      signals.push("name");
    }
    if (detail.nav !== null) {
      signals.push("nav");
    }
    if (detail.navHistory.length > 0) {
      signals.push("navHistory");
    }

    return signals;
  }

  private inspectDetailScript(script: string | null) {
    const code = script ? parseJsStringVariable(script, "fS_code") : null;
    const name = script ? parseJsStringVariable(script, "fS_name") : null;
    const trend = script
      ? parseJsJsonVariable<NetWorthTrendItem[]>(script, "Data_netWorthTrend")
      : null;
    const latestTrendPoint = trend?.at(-1);
    const nav = toNumberOrNull(latestTrendPoint?.y);

    return {
      hasContent: Boolean(script?.trim()),
      code,
      hasCode: Boolean(code),
      name,
      hasName: Boolean(name),
      nav,
      hasNav: nav !== null,
      navPointCount: trend?.length ?? 0,
      hasCoreData: Boolean(code || name || nav !== null),
    };
  }

  private inspectLatestNav(latestNav: LatestNavPayload | null) {
    const nav = toNumberOrNull(latestNav?.dwjz);

    return {
      fundcode: latestNav?.fundcode ?? null,
      hasCode: Boolean(latestNav?.fundcode),
      name: latestNav?.name ?? null,
      hasName: Boolean(latestNav?.name),
      nav,
      hasNav: nav !== null,
      navDate: normalizeDate(latestNav?.jzrq),
      hasCoreData: Boolean(latestNav?.fundcode || latestNav?.name || nav !== null),
    };
  }

  private inspectNavHistory(navHistory: FundNavPoint[]) {
    return {
      navHistoryCount: navHistory.length,
      latestDate: navHistory.at(-1)?.navDate ?? null,
      latestNav: navHistory.at(-1)?.unitNav ?? null,
      hasCoreData: navHistory.length > 0,
    };
  }

  private async fetchNavHistory(code: string): Promise<FundNavPoint[]> {
    const html = await this.fetchText(this.getHistoryUrl(code, 100));
    const history = parseEastMoneyHistoryHtml(html, code);

    if (history.length === 0) {
      throw new Error(`未解析到基金 ${code} 的东方财富历史净值`);
    }

    return history;
  }

  private async fetchText(url: string): Promise<string> {
    devLog("EastMoney 请求 URL", { url });
    if (this.proxyUrl) {
      return fetchTextViaProxy(url, this.proxyUrl, this.timeoutMs);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await this.fetcher(url, {
        cache: "no-store",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; AI-Fund-Advisor/0.1; +https://localhost)",
          Referer: "https://fund.eastmoney.com/",
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`天天基金请求失败：${response.status}`);
      }

      return response.text();
    } finally {
      clearTimeout(timeout);
    }
  }

  private getDetailUrl(code: string) {
    return `https://fund.eastmoney.com/pingzhongdata/${code}.js`;
  }

  private getLatestNavUrl(code: string) {
    return `https://fundgz.1234567.com.cn/js/${code}.js`;
  }

  private getHistoryUrl(code: string, per: number) {
    return `https://fund.eastmoney.com/f10/F10DataApi.aspx?type=lsjz&code=${code}&page=1&per=${per}`;
  }
}

const fetchTextViaProxy = (
  targetUrl: string,
  proxyUrl: string,
  timeoutMs: number,
) =>
  new Promise<string>((resolve, reject) => {
    const target = new URL(targetUrl);
    const proxy = new URL(proxyUrl);
    const isHttpsTarget = target.protocol === "https:";
    const isHttpProxy = proxy.protocol === "http:";

    if (!isHttpProxy) {
      reject(new Error("FUND_DATA_PROXY_URL 当前仅支持 http:// 代理"));
      return;
    }

    const cleanup = () => clearTimeout(timeout);
    const finish = (error: unknown, body?: string) => {
      cleanup();
      if (error) {
        reject(error);
      } else {
        resolve(body ?? "");
      }
    };
    const timeout = setTimeout(() => {
      finish(new Error(`代理请求超时：${timeoutMs}ms`));
    }, timeoutMs);

    const requestOptions = isHttpsTarget
      ? {
          host: proxy.hostname,
          port: Number(proxy.port || 80),
          method: "CONNECT",
          path: `${target.hostname}:${target.port || 443}`,
          headers: {
            Host: `${target.hostname}:${target.port || 443}`,
          },
        }
      : {
          host: proxy.hostname,
          port: Number(proxy.port || 80),
          method: "GET",
          path: targetUrl,
          headers: {
            Host: target.host,
            "User-Agent":
              "Mozilla/5.0 (compatible; AI-Fund-Advisor/0.1; +https://localhost)",
            Referer: "https://fund.eastmoney.com/",
          },
        };
    const proxyRequest = httpRequest(requestOptions);

    proxyRequest.on("error", finish);

    if (!isHttpsTarget) {
      proxyRequest.on("response", (response) => {
        const chunks: Buffer[] = [];

        response.on("data", (chunk: Buffer) => chunks.push(chunk));
        response.on("end", () => {
          const body = Buffer.concat(chunks).toString("utf8");
          if (!response.statusCode || response.statusCode < 200 || response.statusCode >= 300) {
            finish(new Error(`代理 HTTP 请求失败：${response.statusCode}`));
            return;
          }

          finish(null, body);
        });
      });
      proxyRequest.end();
      return;
    }

    proxyRequest.on("connect", (response, socket) => {
      if (response.statusCode !== 200) {
        socket.destroy();
        finish(new Error(`代理 CONNECT 失败：${response.statusCode}`));
        return;
      }

      const proxiedRequest = httpsRequest({
        host: target.hostname,
        path: `${target.pathname}${target.search}`,
        method: "GET",
        servername: target.hostname,
        createConnection: () =>
          tlsConnect({
            socket,
            servername: target.hostname,
          }),
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; AI-Fund-Advisor/0.1; +https://localhost)",
          Referer: "https://fund.eastmoney.com/",
        },
      });
      const chunks: Buffer[] = [];

      proxiedRequest.on("response", (response) => {
        response.on("data", (chunk: Buffer) => chunks.push(chunk));
        response.on("end", () => {
          const body = Buffer.concat(chunks).toString("utf8");
          if (!response.statusCode || response.statusCode < 200 || response.statusCode >= 300) {
            finish(new Error(`代理 HTTPS 请求失败：${response.statusCode}`));
            return;
          }

          finish(null, body);
        });
      });
      proxiedRequest.on("error", finish);
      proxiedRequest.end();
    });
    proxyRequest.end();
  });

const getReturnByName = (
  grandTotal: GrandTotalItem[] | null,
  name: string,
): number | null => {
  const item = grandTotal?.find((entry) => entry.name?.includes(name));

  return percentToDecimal(item?.data?.[0]);
};

const parseAssetAllocation = (
  items: AssetAllocationItem[] | null,
): FundDetail["assetAllocation"] => {
  const result: FundDetail["assetAllocation"] = {
    stock: null,
    bond: null,
    cash: null,
    other: null,
  };

  items?.forEach((item) => {
    const label = item.type ?? item.name ?? "";
    const value = percentToDecimal(item.value ?? item.ratio);

    if (label.includes("股票")) {
      result.stock = value;
    } else if (label.includes("债券")) {
      result.bond = value;
    } else if (label.includes("现金")) {
      result.cash = value;
    } else if (label.includes("其他")) {
      result.other = value;
    }
  });

  return result;
};

const detailToInfo = (detail: FundDetail): FundInfo => ({
  code: detail.code,
  name: detail.name,
  type: detail.type ?? unavailableText,
  fundSize: detail.scale ?? unavailableText,
  riskLevel: detail.riskLevel ?? unavailableText,
  manager: detail.manager ?? unavailableText,
  company: detail.fundCompany ?? unavailableText,
  trackingIndex: null,
  inceptionDate: normalizeDate(detail.establishDate),
  currency: "CNY",
  latestUnitNav: detail.nav,
  latestNavDate: normalizeDate(detail.navDate),
  disclaimer,
  source: detail.source,
  isMock: detail.isMock,
  updatedAt: detail.updatedAt,
});

const detailToPerformance = (detail: FundDetail): FundPerformance => ({
  code: detail.code,
  recentOneMonthReturn: detail.performance.oneMonth,
  recentThreeMonthReturn: detail.performance.threeMonths,
  recentSixMonthReturn: detail.performance.sixMonths,
  recentOneYearReturn: detail.performance.oneYear,
  maxDrawdown: null,
  volatility: null,
  disclaimer,
  source: detail.source,
  isMock: detail.isMock,
  updatedAt: detail.updatedAt,
});

export class FallbackFundProvider implements FundProvider {
  constructor(
    private readonly primaryProvider: FundProvider,
    private readonly fallbackProvider: FundProvider,
  ) {}

  async searchFunds(keyword: string): Promise<FundSearchResult[]> {
    return this.withFallback(
      () => this.primaryProvider.searchFunds(keyword),
      () => this.fallbackProvider.searchFunds(keyword),
      (funds) => funds.length > 0,
      { operation: "searchFunds", code: keyword },
    );
  }

  async getFundInfo(code: string): Promise<FundInfo> {
    return this.withFallback(
      () => this.primaryProvider.getFundInfo(code),
      () => this.fallbackProvider.getFundInfo(code),
      undefined,
      { operation: "getFundInfo", code },
    );
  }

  async getFundNavHistory(code: string): Promise<FundNavPoint[]> {
    return this.withFallback(
      () => this.primaryProvider.getFundNavHistory(code),
      () => this.fallbackProvider.getFundNavHistory(code),
      (history) => history.length > 0,
      { operation: "getFundNavHistory", code },
    );
  }

  async getFundPerformance(code: string): Promise<FundPerformance> {
    return this.withFallback(
      () => this.primaryProvider.getFundPerformance(code),
      () => this.fallbackProvider.getFundPerformance(code),
      undefined,
      { operation: "getFundPerformance", code },
    );
  }

  async getFundDetail(code: string): Promise<FundDetail> {
    return this.withFallback(
      () => this.primaryProvider.getFundDetail(code),
      () => this.fallbackProvider.getFundDetail(code),
      undefined,
      { operation: "getFundDetail", code },
    );
  }

  private async withFallback<T>(
    getPrimaryValue: () => Promise<T>,
    getFallbackValue: () => Promise<T>,
    isValid = (value: T) => Boolean(value),
    context: { operation: string; code: string },
  ) {
    try {
      const primaryValue = await getPrimaryValue();

      if (!isValid(primaryValue)) {
        throw new Error("真实基金数据为空");
      }

      return primaryValue;
    } catch (error) {
      devLog("Fallback 到 MockProvider", {
        ...context,
        reason: errorMessage(error),
      });

      return getFallbackValue();
    }
  }
}

const createDefaultFundProvider = (): FundProvider => {
  const providerName = process.env.FUND_DATA_PROVIDER ?? "eastmoney";
  const mockProvider = new MockProvider();

  devLog("当前 provider", { provider: providerName });

  if (providerName === "mock") {
    return mockProvider;
  }

  return new FallbackFundProvider(new EastMoneyFundProvider(), mockProvider);
};

export const fundProvider: FundProvider = createDefaultFundProvider();

export const getFundProviderDiagnostics = async (
  code: string,
): Promise<FundProviderDiagnostics> => {
  const provider = new EastMoneyFundProvider();

  return provider.diagnose(code);
};
