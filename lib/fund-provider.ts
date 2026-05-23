import { z } from "zod";

export const disclaimer = "不构成投资建议，仅供个人分析参考。";

const fundCodeSchema = z.string().regex(/^\d{6}$/, "基金代码必须是 6 位数字");
const keywordSchema = z.string().trim().max(50, "搜索关键词不能超过 50 个字符");

export const fundSearchResultSchema = z.object({
  code: fundCodeSchema,
  name: z.string().min(1),
  type: z.string().min(1),
  fundSize: z.string().min(1),
  riskLevel: z.string().min(1),
  source: z.string().min(1),
});

export const fundInfoSchema = fundSearchResultSchema.extend({
  manager: z.string().min(1),
  company: z.string().min(1),
  trackingIndex: z.string().nullable(),
  inceptionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  currency: z.literal("CNY"),
  disclaimer: z.literal(disclaimer),
});

export const fundNavPointSchema = z.object({
  code: fundCodeSchema,
  navDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  unitNav: z.number().positive(),
  accumulatedNav: z.number().positive().nullable(),
  dailyReturn: z.number().nullable(),
  source: z.string().min(1),
});

export const fundPerformanceSchema = z.object({
  code: fundCodeSchema,
  recentOneMonthReturn: z.number().nullable(),
  recentThreeMonthReturn: z.number().nullable(),
  recentSixMonthReturn: z.number().nullable(),
  recentOneYearReturn: z.number().nullable(),
  maxDrawdown: z.number().nullable(),
  volatility: z.number().nullable(),
  source: z.string().min(1),
  disclaimer: z.literal(disclaimer),
});

export type FundSearchResult = z.infer<typeof fundSearchResultSchema>;
export type FundInfo = z.infer<typeof fundInfoSchema>;
export type FundNavPoint = z.infer<typeof fundNavPointSchema>;
export type FundPerformance = z.infer<typeof fundPerformanceSchema>;

export interface FundProvider {
  searchFunds(keyword: string): Promise<FundSearchResult[]>;
  getFundInfo(code: string): Promise<FundInfo>;
  getFundNavHistory(code: string): Promise<FundNavPoint[]>;
  getFundPerformance(code: string): Promise<FundPerformance>;
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
}

const mockFunds: FundInfo[] = [
  {
    code: "000001",
    name: "稳健成长混合A",
    type: "混合型",
    fundSize: "23.50 亿元",
    riskLevel: "中风险",
    source: "mock",
    manager: "张明",
    company: "示例基金管理有限公司",
    trackingIndex: null,
    inceptionDate: "2018-03-15",
    currency: "CNY",
    disclaimer,
  },
  {
    code: "510300",
    name: "沪深300指数增强",
    type: "指数型",
    fundSize: "68.20 亿元",
    riskLevel: "中高风险",
    source: "mock",
    manager: "李华",
    company: "示例资产管理有限公司",
    trackingIndex: "沪深300",
    inceptionDate: "2015-06-01",
    currency: "CNY",
    disclaimer,
  },
  {
    code: "110022",
    name: "安心债券A",
    type: "债券型",
    fundSize: "12.80 亿元",
    riskLevel: "中低风险",
    source: "mock",
    manager: "王宁",
    company: "示例稳健基金有限公司",
    trackingIndex: null,
    inceptionDate: "2020-01-10",
    currency: "CNY",
    disclaimer,
  },
];

const mockNavHistory: Record<string, FundNavPoint[]> = {
  "000001": [
    {
      code: "000001",
      navDate: "2026-05-19",
      unitNav: 1.234,
      accumulatedNav: 1.534,
      dailyReturn: -0.0021,
      source: "mock",
    },
    {
      code: "000001",
      navDate: "2026-05-20",
      unitNav: 1.238,
      accumulatedNav: 1.538,
      dailyReturn: 0.0032,
      source: "mock",
    },
    {
      code: "000001",
      navDate: "2026-05-21",
      unitNav: 1.245,
      accumulatedNav: 1.545,
      dailyReturn: 0.0057,
      source: "mock",
    },
  ],
  "510300": [
    {
      code: "510300",
      navDate: "2026-05-19",
      unitNav: 4.138,
      accumulatedNav: 4.138,
      dailyReturn: 0.0024,
      source: "mock",
    },
    {
      code: "510300",
      navDate: "2026-05-20",
      unitNav: 4.12,
      accumulatedNav: 4.12,
      dailyReturn: -0.0045,
      source: "mock",
    },
    {
      code: "510300",
      navDate: "2026-05-21",
      unitNav: 4.168,
      accumulatedNav: 4.168,
      dailyReturn: 0.0117,
      source: "mock",
    },
  ],
  "110022": [
    {
      code: "110022",
      navDate: "2026-05-19",
      unitNav: 1.0811,
      accumulatedNav: 1.1451,
      dailyReturn: 0.0004,
      source: "mock",
    },
    {
      code: "110022",
      navDate: "2026-05-20",
      unitNav: 1.082,
      accumulatedNav: 1.146,
      dailyReturn: 0.0008,
      source: "mock",
    },
    {
      code: "110022",
      navDate: "2026-05-21",
      unitNav: 1.0831,
      accumulatedNav: 1.1471,
      dailyReturn: 0.001,
      source: "mock",
    },
  ],
};

const mockPerformance: Record<string, FundPerformance> = {
  "000001": {
    code: "000001",
    recentOneMonthReturn: 0.0185,
    recentThreeMonthReturn: 0.032,
    recentSixMonthReturn: 0.047,
    recentOneYearReturn: 0.083,
    maxDrawdown: -0.042,
    volatility: 0.136,
    source: "mock",
    disclaimer,
  },
  "510300": {
    code: "510300",
    recentOneMonthReturn: 0.0291,
    recentThreeMonthReturn: 0.061,
    recentSixMonthReturn: 0.074,
    recentOneYearReturn: 0.118,
    maxDrawdown: -0.068,
    volatility: 0.182,
    source: "mock",
    disclaimer,
  },
  "110022": {
    code: "110022",
    recentOneMonthReturn: 0.0042,
    recentThreeMonthReturn: 0.009,
    recentSixMonthReturn: 0.017,
    recentOneYearReturn: 0.031,
    maxDrawdown: -0.006,
    volatility: 0.025,
    source: "mock",
    disclaimer,
  },
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
            fund.type.toLowerCase().includes(normalizedKeyword),
        )
      : mockFunds;

    return matchedFunds.map(({ code, name, type, fundSize, riskLevel, source }) => ({
      code,
      name,
      type,
      fundSize,
      riskLevel,
      source,
    }));
  }

  protected async getFundInfoAdapter(code: string): Promise<FundInfo> {
    const fund = mockFunds.find((item) => item.code === code);

    if (!fund) {
      throw new Error(`未找到基金代码 ${code} 的 mock 基金信息`);
    }

    return fund;
  }

  protected async getFundNavHistoryAdapter(
    code: string,
  ): Promise<FundNavPoint[]> {
    const navHistory = mockNavHistory[code];

    if (!navHistory) {
      throw new Error(`未找到基金代码 ${code} 的 mock 净值历史`);
    }

    return navHistory;
  }

  protected async getFundPerformanceAdapter(
    code: string,
  ): Promise<FundPerformance> {
    const performance = mockPerformance[code];

    if (!performance) {
      throw new Error(`未找到基金代码 ${code} 的 mock 业绩表现`);
    }

    return performance;
  }
}

abstract class ReservedProvider extends ValidatedFundProvider {
  protected async searchFundsAdapter(): Promise<FundSearchResult[]> {
    throw new Error(`${this.providerName} 暂未启用，请使用默认 MockProvider`);
  }

  protected async getFundInfoAdapter(): Promise<FundInfo> {
    throw new Error(`${this.providerName} 暂未启用，请使用默认 MockProvider`);
  }

  protected async getFundNavHistoryAdapter(): Promise<FundNavPoint[]> {
    throw new Error(`${this.providerName} 暂未启用，请使用默认 MockProvider`);
  }

  protected async getFundPerformanceAdapter(): Promise<FundPerformance> {
    throw new Error(`${this.providerName} 暂未启用，请使用默认 MockProvider`);
  }

  protected abstract readonly providerName: string;
}

export class EastMoneyProvider extends ReservedProvider {
  protected readonly providerName = "EastMoneyProvider";
}

export class AKShareProvider extends ReservedProvider {
  protected readonly providerName = "AKShareProvider";
}

export const fundProvider: FundProvider = new MockProvider();
