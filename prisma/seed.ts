import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const disclaimer = "不构成投资建议，仅供个人分析参考。";

async function main() {
  const balancedFund = await prisma.fund.upsert({
    where: { code: "000001" },
    update: {
      name: "稳健成长混合A",
      type: "混合型",
      manager: "张明",
      company: "示例基金管理有限公司",
      riskLevel: "中风险",
      trackingIndex: null,
      inceptionDate: new Date("2018-03-15T00:00:00.000Z"),
      currency: "CNY",
    },
    create: {
      id: "fund_mock_balanced_a",
      code: "000001",
      name: "稳健成长混合A",
      type: "混合型",
      manager: "张明",
      company: "示例基金管理有限公司",
      riskLevel: "中风险",
      trackingIndex: null,
      inceptionDate: new Date("2018-03-15T00:00:00.000Z"),
      currency: "CNY",
    },
  });

  const indexFund = await prisma.fund.upsert({
    where: { code: "510300" },
    update: {
      name: "沪深300指数增强",
      type: "指数型",
      manager: "李华",
      company: "示例资产管理有限公司",
      riskLevel: "中高风险",
      trackingIndex: "沪深300",
      inceptionDate: new Date("2015-06-01T00:00:00.000Z"),
      currency: "CNY",
    },
    create: {
      id: "fund_mock_csi300_enhanced",
      code: "510300",
      name: "沪深300指数增强",
      type: "指数型",
      manager: "李华",
      company: "示例资产管理有限公司",
      riskLevel: "中高风险",
      trackingIndex: "沪深300",
      inceptionDate: new Date("2015-06-01T00:00:00.000Z"),
      currency: "CNY",
    },
  });

  const bondFund = await prisma.fund.upsert({
    where: { code: "110022" },
    update: {
      name: "安心债券A",
      type: "债券型",
      manager: "王宁",
      company: "示例稳健基金有限公司",
      riskLevel: "中低风险",
      trackingIndex: null,
      inceptionDate: new Date("2020-01-10T00:00:00.000Z"),
      currency: "CNY",
    },
    create: {
      id: "fund_mock_bond_a",
      code: "110022",
      name: "安心债券A",
      type: "债券型",
      manager: "王宁",
      company: "示例稳健基金有限公司",
      riskLevel: "中低风险",
      trackingIndex: null,
      inceptionDate: new Date("2020-01-10T00:00:00.000Z"),
      currency: "CNY",
    },
  });

  const navRows = [
    {
      id: "nav_balanced_2026_05_20",
      fundId: balancedFund.id,
      navDate: new Date("2026-05-20T00:00:00.000Z"),
      unitNav: "1.2380",
      accumulatedNav: "1.5380",
      dailyReturn: "0.0032",
    },
    {
      id: "nav_balanced_2026_05_21",
      fundId: balancedFund.id,
      navDate: new Date("2026-05-21T00:00:00.000Z"),
      unitNav: "1.2450",
      accumulatedNav: "1.5450",
      dailyReturn: "0.0057",
    },
    {
      id: "nav_index_2026_05_20",
      fundId: indexFund.id,
      navDate: new Date("2026-05-20T00:00:00.000Z"),
      unitNav: "4.1200",
      accumulatedNav: "4.1200",
      dailyReturn: "-0.0045",
    },
    {
      id: "nav_index_2026_05_21",
      fundId: indexFund.id,
      navDate: new Date("2026-05-21T00:00:00.000Z"),
      unitNav: "4.1680",
      accumulatedNav: "4.1680",
      dailyReturn: "0.0117",
    },
    {
      id: "nav_bond_2026_05_20",
      fundId: bondFund.id,
      navDate: new Date("2026-05-20T00:00:00.000Z"),
      unitNav: "1.0820",
      accumulatedNav: "1.1460",
      dailyReturn: "0.0008",
    },
    {
      id: "nav_bond_2026_05_21",
      fundId: bondFund.id,
      navDate: new Date("2026-05-21T00:00:00.000Z"),
      unitNav: "1.0831",
      accumulatedNav: "1.1471",
      dailyReturn: "0.0010",
    },
  ];

  for (const nav of navRows) {
    await prisma.fundNav.upsert({
      where: {
        fundId_navDate: {
          fundId: nav.fundId,
          navDate: nav.navDate,
        },
      },
      update: {
        unitNav: nav.unitNav,
        accumulatedNav: nav.accumulatedNav,
        dailyReturn: nav.dailyReturn,
        source: "mock",
      },
      create: {
        ...nav,
        source: "mock",
      },
    });
  }

  const balancedHolding = await prisma.holding.upsert({
    where: { id: "holding_mock_balanced_default" },
    update: {
      fundId: balancedFund.id,
      accountName: "默认账户",
      units: "8064.5161",
      averageCost: "1.2400",
      totalCost: "10000.00",
      currentValue: "10040.32",
      purchaseDate: new Date("2026-01-15T00:00:00.000Z"),
      note: "用于验证本地持仓数据模型的 mock 持仓。",
    },
    create: {
      id: "holding_mock_balanced_default",
      fundId: balancedFund.id,
      accountName: "默认账户",
      units: "8064.5161",
      averageCost: "1.2400",
      totalCost: "10000.00",
      currentValue: "10040.32",
      purchaseDate: new Date("2026-01-15T00:00:00.000Z"),
      note: "用于验证本地持仓数据模型的 mock 持仓。",
    },
  });

  const indexHolding = await prisma.holding.upsert({
    where: { id: "holding_mock_index_default" },
    update: {
      fundId: indexFund.id,
      accountName: "默认账户",
      units: "1200.0000",
      averageCost: "4.0500",
      totalCost: "4860.00",
      currentValue: "5001.60",
      purchaseDate: new Date("2026-02-20T00:00:00.000Z"),
      note: "指数基金 mock 持仓，用于后续分析页面联调。",
    },
    create: {
      id: "holding_mock_index_default",
      fundId: indexFund.id,
      accountName: "默认账户",
      units: "1200.0000",
      averageCost: "4.0500",
      totalCost: "4860.00",
      currentValue: "5001.60",
      purchaseDate: new Date("2026-02-20T00:00:00.000Z"),
      note: "指数基金 mock 持仓，用于后续分析页面联调。",
    },
  });

  const balancedReport = await prisma.analysisReport.upsert({
    where: { id: "report_mock_balanced_2026_05_21" },
    update: {
      fundId: balancedFund.id,
      holdingId: balancedHolding.id,
      reportDate: new Date("2026-05-21T00:00:00.000Z"),
      metrics: {
        periodReturn: "0.0185",
        maxDrawdown: "-0.0420",
        volatility: "0.1360",
        sampleDays: 120,
      },
      riskResult: {
        level: "中",
        triggeredRules: ["波动率处于中等区间", "持仓集中度待后续接入组合数据后评估"],
      },
      summary: "mock 分析显示该基金近期波动处于可观察区间，仍需结合个人风险承受能力人工复核。",
      disclaimer,
    },
    create: {
      id: "report_mock_balanced_2026_05_21",
      fundId: balancedFund.id,
      holdingId: balancedHolding.id,
      reportDate: new Date("2026-05-21T00:00:00.000Z"),
      metrics: {
        periodReturn: "0.0185",
        maxDrawdown: "-0.0420",
        volatility: "0.1360",
        sampleDays: 120,
      },
      riskResult: {
        level: "中",
        triggeredRules: ["波动率处于中等区间", "持仓集中度待后续接入组合数据后评估"],
      },
      summary: "mock 分析显示该基金近期波动处于可观察区间，仍需结合个人风险承受能力人工复核。",
      disclaimer,
    },
  });

  const indexReport = await prisma.analysisReport.upsert({
    where: { id: "report_mock_index_2026_05_21" },
    update: {
      fundId: indexFund.id,
      holdingId: indexHolding.id,
      reportDate: new Date("2026-05-21T00:00:00.000Z"),
      metrics: {
        periodReturn: "0.0291",
        maxDrawdown: "-0.0680",
        volatility: "0.1820",
        sampleDays: 120,
      },
      riskResult: {
        level: "中高",
        triggeredRules: ["权益指数波动较高", "需关注单一指数暴露"],
      },
      summary: "mock 分析显示指数基金对市场波动较敏感，适合继续跟踪而非由系统直接决策。",
      disclaimer,
    },
    create: {
      id: "report_mock_index_2026_05_21",
      fundId: indexFund.id,
      holdingId: indexHolding.id,
      reportDate: new Date("2026-05-21T00:00:00.000Z"),
      metrics: {
        periodReturn: "0.0291",
        maxDrawdown: "-0.0680",
        volatility: "0.1820",
        sampleDays: 120,
      },
      riskResult: {
        level: "中高",
        triggeredRules: ["权益指数波动较高", "需关注单一指数暴露"],
      },
      summary: "mock 分析显示指数基金对市场波动较敏感，适合继续跟踪而非由系统直接决策。",
      disclaimer,
    },
  });

  await prisma.recommendation.upsert({
    where: { id: "recommendation_mock_balanced_watch" },
    update: {
      fundId: balancedFund.id,
      holdingId: balancedHolding.id,
      analysisReportId: balancedReport.id,
      actionType: "继续跟踪",
      riskLevel: "中",
      reasons: {
        points: ["短期波动未触发高风险阈值", "当前仅为 mock 数据，不能替代真实净值与组合分析"],
      },
      aiExplanation: {
        role: "解释分析过程",
        conclusion: "保持观察，并由用户结合个人情况人工判断。",
        mustNotDo: "AI 不直接决定买卖。",
      },
      disclaimer,
    },
    create: {
      id: "recommendation_mock_balanced_watch",
      fundId: balancedFund.id,
      holdingId: balancedHolding.id,
      analysisReportId: balancedReport.id,
      actionType: "继续跟踪",
      riskLevel: "中",
      reasons: {
        points: ["短期波动未触发高风险阈值", "当前仅为 mock 数据，不能替代真实净值与组合分析"],
      },
      aiExplanation: {
        role: "解释分析过程",
        conclusion: "保持观察，并由用户结合个人情况人工判断。",
        mustNotDo: "AI 不直接决定买卖。",
      },
      disclaimer,
    },
  });

  await prisma.recommendation.upsert({
    where: { id: "recommendation_mock_index_review" },
    update: {
      fundId: indexFund.id,
      holdingId: indexHolding.id,
      analysisReportId: indexReport.id,
      actionType: "人工复核",
      riskLevel: "中高",
      reasons: {
        points: ["权益指数波动较高", "后续需要结合总资产配置比例判断风险暴露"],
      },
      aiExplanation: {
        role: "解释分析过程",
        conclusion: "提示关注波动和集中度，不给出交易指令。",
        mustNotDo: "AI 不直接决定买卖。",
      },
      disclaimer,
    },
    create: {
      id: "recommendation_mock_index_review",
      fundId: indexFund.id,
      holdingId: indexHolding.id,
      analysisReportId: indexReport.id,
      actionType: "人工复核",
      riskLevel: "中高",
      reasons: {
        points: ["权益指数波动较高", "后续需要结合总资产配置比例判断风险暴露"],
      },
      aiExplanation: {
        role: "解释分析过程",
        conclusion: "提示关注波动和集中度，不给出交易指令。",
        mustNotDo: "AI 不直接决定买卖。",
      },
      disclaimer,
    },
  });

  await prisma.analysisReport.upsert({
    where: { id: "report_mock_bond_2026_05_21" },
    update: {
      fundId: bondFund.id,
      holdingId: null,
      reportDate: new Date("2026-05-21T00:00:00.000Z"),
      metrics: {
        periodReturn: "0.0042",
        maxDrawdown: "-0.0060",
        volatility: "0.0250",
        sampleDays: 120,
      },
      riskResult: {
        level: "中低",
        triggeredRules: ["债券型基金波动相对较低", "仍需关注利率风险"],
      },
      summary: "mock 分析显示债券基金波动相对平缓，后续可作为组合稳定性观察对象。",
      disclaimer,
    },
    create: {
      id: "report_mock_bond_2026_05_21",
      fundId: bondFund.id,
      holdingId: null,
      reportDate: new Date("2026-05-21T00:00:00.000Z"),
      metrics: {
        periodReturn: "0.0042",
        maxDrawdown: "-0.0060",
        volatility: "0.0250",
        sampleDays: 120,
      },
      riskResult: {
        level: "中低",
        triggeredRules: ["债券型基金波动相对较低", "仍需关注利率风险"],
      },
      summary: "mock 分析显示债券基金波动相对平缓，后续可作为组合稳定性观察对象。",
      disclaimer,
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
