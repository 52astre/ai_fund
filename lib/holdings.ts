import { z } from "zod";
import { fundProvider } from "@/lib/fund-provider";
import { prisma } from "@/lib/prisma";

export const holdingFormSchema = z.object({
  holdingId: z.string().trim().optional(),
  fundCode: z.string().regex(/^\d{6}$/, "基金代码必须是 6 位数字"),
  units: z.coerce.number().positive("份额必须大于 0"),
  averageCost: z.coerce.number().positive("成本价必须大于 0"),
  purchaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "请选择建仓日期"),
  note: z.string().trim().max(200, "备注不能超过 200 个字符").optional(),
});

export type HoldingFormInput = z.infer<typeof holdingFormSchema>;

export type HoldingView = {
  id: string;
  fundCode: string;
  fundName: string;
  fundType: string;
  units: number;
  averageCost: number;
  holdingAmount: number;
  currentReturn: number;
  totalReturnRate: number;
  purchaseDate: string;
  note: string | null;
  latestUnitNav: number;
  latestNavSource: "eastmoney" | "mock";
  latestNavIsMock: boolean;
  latestNavUpdatedAt: string;
};

type LatestNavSnapshot = {
  unitNav: number;
  source: "eastmoney" | "mock";
  isMock: boolean;
  updatedAt: string;
};

const toNumber = (value: unknown) => Number(value);

const toDateInputValue = (value: Date) => value.toISOString().slice(0, 10);

async function getOrCreateFund(code: string) {
  const existingFund = await prisma.fund.findUnique({
    where: { code },
  });

  if (existingFund) {
    return existingFund;
  }

  const fundInfo = await fundProvider.getFundInfo(code);

  return prisma.fund.create({
    data: {
      code: fundInfo.code,
      name: fundInfo.name,
      type: fundInfo.type,
      manager: fundInfo.manager,
      company: fundInfo.company,
      riskLevel: fundInfo.riskLevel,
      trackingIndex: fundInfo.trackingIndex,
      inceptionDate: fundInfo.inceptionDate
        ? new Date(`${fundInfo.inceptionDate}T00:00:00.000Z`)
        : null,
      currency: fundInfo.currency,
    },
  });
}

async function getLatestUnitNav(
  fundId: string,
  fundCode: string,
): Promise<LatestNavSnapshot> {
  const latestNav = await prisma.fundNav.findFirst({
    where: { fundId },
    orderBy: { navDate: "desc" },
  });

  if (latestNav) {
    return {
      unitNav: toNumber(latestNav.unitNav),
      source: latestNav.source === "eastmoney" ? "eastmoney" : "mock",
      isMock: latestNav.source !== "eastmoney",
      updatedAt: latestNav.createdAt.toISOString(),
    };
  }

  const providerNavHistory = await fundProvider.getFundNavHistory(fundCode);
  const latestProviderNav = providerNavHistory.at(-1);

  return {
    unitNav: latestProviderNav?.unitNav ?? 0,
    source: latestProviderNav?.source ?? "mock",
    isMock: latestProviderNav?.isMock ?? true,
    updatedAt: latestProviderNav?.updatedAt ?? new Date().toISOString(),
  };
}

export async function listHoldingViews(): Promise<HoldingView[]> {
  const holdings = await prisma.holding.findMany({
    include: { fund: true },
    orderBy: { updatedAt: "desc" },
  });

  return Promise.all(
    holdings.map(async (holding) => {
      const units = toNumber(holding.units);
      const averageCost = toNumber(holding.averageCost);
      const latestNav = await getLatestUnitNav(
        holding.fundId,
        holding.fund.code,
      );
      const totalCost = units * averageCost;
      const holdingAmount = units * latestNav.unitNav;
      const currentReturn = holdingAmount - totalCost;
      const totalReturnRate = totalCost > 0 ? currentReturn / totalCost : 0;

      return {
        id: holding.id,
        fundCode: holding.fund.code,
        fundName: holding.fund.name,
        fundType: holding.fund.type,
        units,
        averageCost,
        holdingAmount,
        currentReturn,
        totalReturnRate,
        purchaseDate: toDateInputValue(holding.purchaseDate),
        note: holding.note,
        latestUnitNav: latestNav.unitNav,
        latestNavSource: latestNav.source,
        latestNavIsMock: latestNav.isMock,
        latestNavUpdatedAt: latestNav.updatedAt,
      };
    }),
  );
}

export async function getHoldingViewByFundCode(
  fundCode: string,
): Promise<HoldingView | null> {
  const holding = await prisma.holding.findFirst({
    where: {
      fund: {
        code: fundCode,
      },
    },
    include: { fund: true },
    orderBy: { updatedAt: "desc" },
  });

  if (!holding) {
    return null;
  }

  const units = toNumber(holding.units);
  const averageCost = toNumber(holding.averageCost);
  const latestNav = await getLatestUnitNav(holding.fundId, fundCode);
  const totalCost = units * averageCost;
  const holdingAmount = units * latestNav.unitNav;
  const currentReturn = holdingAmount - totalCost;
  const totalReturnRate = totalCost > 0 ? currentReturn / totalCost : 0;

  return {
    id: holding.id,
    fundCode: holding.fund.code,
    fundName: holding.fund.name,
    fundType: holding.fund.type,
    units,
    averageCost,
    holdingAmount,
    currentReturn,
    totalReturnRate,
    purchaseDate: toDateInputValue(holding.purchaseDate),
    note: holding.note,
    latestUnitNav: latestNav.unitNav,
    latestNavSource: latestNav.source,
    latestNavIsMock: latestNav.isMock,
    latestNavUpdatedAt: latestNav.updatedAt,
  };
}

export async function upsertHolding(input: HoldingFormInput) {
  const fund = await getOrCreateFund(input.fundCode);
  const totalCost = input.units * input.averageCost;
  const purchaseDate = new Date(`${input.purchaseDate}T00:00:00.000Z`);
  const note = input.note || null;

  if (input.holdingId) {
    await prisma.holding.update({
      where: { id: input.holdingId },
      data: {
        fundId: fund.id,
        units: input.units,
        averageCost: input.averageCost,
        totalCost,
        currentValue: null,
        purchaseDate,
        note,
      },
    });

    return;
  }

  await prisma.holding.create({
    data: {
      fundId: fund.id,
      accountName: "默认账户",
      units: input.units,
      averageCost: input.averageCost,
      totalCost,
      currentValue: null,
      purchaseDate,
      note,
    },
  });
}

export async function deleteHolding(id: string) {
  const parsedId = z.string().min(1).parse(id);

  await prisma.holding.delete({
    where: { id: parsedId },
  });
}
