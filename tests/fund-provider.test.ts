import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  disclaimer,
  fundInfoSchema,
  fundNavPointSchema,
  fundPerformanceSchema,
  fundProvider,
  fundSearchResultSchema,
  MockProvider,
} from "../lib/fund-provider";

describe("基金数据 Provider", () => {
  it("默认 Provider 返回 mock 基金列表", async () => {
    const funds = await fundProvider.searchFunds("");

    expect(funds.length).toBeGreaterThan(0);
    expect(funds.every((fund) => fund.source === "mock")).toBe(true);
    expect(fundSearchResultSchema.array().parse(funds)).toEqual(funds);
  });

  it("四个接口返回结构均通过 Zod 校验", async () => {
    const provider = new MockProvider();

    const funds = await provider.searchFunds("沪深300");
    const info = await provider.getFundInfo("510300");
    const navHistory = await provider.getFundNavHistory("510300");
    const performance = await provider.getFundPerformance("510300");

    expect(fundSearchResultSchema.array().parse(funds)).toEqual(funds);
    expect(fundInfoSchema.parse(info)).toEqual(info);
    expect(fundNavPointSchema.array().parse(navHistory)).toEqual(navHistory);
    expect(fundPerformanceSchema.parse(performance)).toEqual(performance);
    expect(funds[0]?.fundSize).toBe("68.20 亿元");
    expect(info.fundSize).toBe("68.20 亿元");
    expect(info.disclaimer).toBe(disclaimer);
    expect(performance.disclaimer).toBe(disclaimer);
  });

  it("支持按基金名称搜索", async () => {
    const provider = new MockProvider();

    const funds = await provider.searchFunds("沪深300");

    expect(funds).toHaveLength(1);
    expect(funds[0]).toMatchObject({
      code: "510300",
      name: "沪深300指数增强",
      fundSize: "68.20 亿元",
    });
  });

  it("支持按基金代码搜索", async () => {
    const provider = new MockProvider();

    const funds = await provider.searchFunds("510300");

    expect(funds).toHaveLength(1);
    expect(funds[0]).toMatchObject({
      code: "510300",
      name: "沪深300指数增强",
      fundSize: "68.20 亿元",
    });
    expect(fundSearchResultSchema.array().parse(funds)).toEqual(funds);
  });

  it("空关键词搜索返回默认 mock 列表", async () => {
    const provider = new MockProvider();

    await expect(provider.searchFunds("")).resolves.toHaveLength(3);
  });

  it("非法基金代码会被 Zod 拒绝", async () => {
    const provider = new MockProvider();

    await expect(provider.getFundInfo("ABC123")).rejects.toBeInstanceOf(
      z.ZodError,
    );
  });
});
