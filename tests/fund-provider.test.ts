import { readFile } from "node:fs/promises";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import {
  disclaimer,
  EastMoneyFundProvider,
  FallbackFundProvider,
  fundDetailSchema,
  fundInfoSchema,
  fundNavPointSchema,
  fundPerformanceSchema,
  fundSearchResultSchema,
  MockProvider,
  parseEastMoneyHistoryHtml,
  parseJsonpPayload,
} from "../lib/fund-provider";

const createFetchMock = (responses: Record<string, string | Error>) =>
  vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    const matchedEntry = Object.entries(responses).find(([key]) =>
      url.includes(key),
    );

    if (!matchedEntry) {
      return new Response("not found", { status: 404 });
    }

    const body = matchedEntry[1];

    if (body instanceof Error) {
      throw body;
    }

    return new Response(body, { status: 200 });
  });

const realDetailScript = `
  var fS_name = "真实基金";
  var fS_code = "000001";
  var Data_netWorthTrend = [{"x":1779321600000,"y":1.2345,"equityReturn":0.12}];
  var Data_ACWorthTrend = [[1779321600000,2.3456]];
  var Data_currentFundManager = [{"name":"张三","power":{"avr":"5.20"}}];
  var Data_grandTotal = [{"name":"近1月","data":["2.50"]},{"name":"近3月","data":["3.50"]}];
  var Data_assetAllocation = [{"type":"股票","value":"65.00"},{"type":"债券","value":"10.00"}];
  var Data_stockPosition = [{"GPDM":"600000","GPJC":"浦发银行","JZBL":"3.21","PCTNVCHG":"1.10","NEWTEXCH":"1.20亿元"}];
`;

const latestNavJsonp =
  'jsonpgz({"fundcode":"000001","name":"真实基金","jzrq":"2026-05-21","dwjz":"1.2345"});';

const historyHtml =
  "<tr><td>2026-05-21</td><td>1.2345</td><td>2.3456</td><td>1.23%</td></tr>";

describe("基金数据 Provider", () => {
  it("正常解析最新净值 JSONP", () => {
    const payload = parseJsonpPayload<{ fundcode: string; dwjz: string }>(
      'jsonpgz({"fundcode":"000001","dwjz":"1.2345"});',
    );

    expect(payload).toEqual({ fundcode: "000001", dwjz: "1.2345" });
  });

  it("正常解析东方财富历史净值 HTML 表格", () => {
    const history = parseEastMoneyHistoryHtml(
      `
        <table>
          <tr><th>净值日期</th><th>单位净值</th><th>累计净值</th><th>日增长率</th></tr>
          <tr><td>2026-05-21</td><td>1.2345</td><td>2.3456</td><td>1.23%</td></tr>
          <tr><td>2026-05-20</td><td>1.2000</td><td>2.3000</td><td>-0.50%</td></tr>
        </table>
      `,
      "000001",
    );

    expect(history).toHaveLength(2);
    expect(history[0]).toMatchObject({
      code: "000001",
      navDate: "2026-05-20",
      unitNav: 1.2,
      accumulatedNav: 2.3,
      dailyReturn: -0.005,
      source: "eastmoney",
      isMock: false,
    });
    expect(fundNavPointSchema.array().parse(history)).toEqual(history);
  });

  it("EastMoney Provider 返回详细结构，缺失非核心字段不伪造且不 fallback", async () => {
    const fetcher = createFetchMock({
      "pingzhongdata/000001.js": realDetailScript,
      "fundgz.1234567.com.cn/js/000001.js": latestNavJsonp,
      "F10DataApi.aspx": historyHtml,
    });
    const provider = new EastMoneyFundProvider({ fetcher, timeoutMs: 1000 });

    const funds = await provider.searchFunds("000001");
    const info = await provider.getFundInfo("000001");
    const navHistory = await provider.getFundNavHistory("000001");
    const performance = await provider.getFundPerformance("000001");
    const detail = await provider.getFundDetail("000001");

    expect(fundSearchResultSchema.array().parse(funds)).toEqual(funds);
    expect(fundInfoSchema.parse(info)).toEqual(info);
    expect(fundNavPointSchema.array().parse(navHistory)).toEqual(navHistory);
    expect(fundPerformanceSchema.parse(performance)).toEqual(performance);
    expect(fundDetailSchema.parse(detail)).toEqual(detail);
    expect(detail).toMatchObject({
      code: "000001",
      name: "真实基金",
      source: "eastmoney",
      isMock: false,
      nav: 1.2345,
      accumulatedNav: 2.3456,
      fundCompany: null,
      custodian: null,
    });
    expect(detail.navHistory).toHaveLength(1);
    expect(detail.stagePerformance.find((row) => row.label === "近3月")?.fund).toBe(
      0.035,
    );
    expect(detail.topStocks[0]).toMatchObject({
      name: "浦发银行",
      code: "600000",
      ratio: 0.0321,
    });
    expect(performance.maxDrawdown).toBeNull();
  });

  it("详情脚本失败但 JSONP 成功时仍返回 eastmoney 详情", async () => {
    const provider = new EastMoneyFundProvider({
      fetcher: createFetchMock({
        "pingzhongdata/000001.js": new Error("detail failed"),
        "fundgz.1234567.com.cn/js/000001.js": latestNavJsonp,
        "F10DataApi.aspx": new Error("history failed"),
      }),
      timeoutMs: 1000,
    });

    const detail = await provider.getFundDetail("000001");

    expect(detail.source).toBe("eastmoney");
    expect(detail.isMock).toBe(false);
    expect(detail.name).toBe("真实基金");
    expect(detail.nav).toBe(1.2345);
    expect(detail.navHistory).toEqual([]);
  });

  it("详情脚本失败但历史净值成功时仍返回 eastmoney 详情", async () => {
    const provider = new EastMoneyFundProvider({
      fetcher: createFetchMock({
        "pingzhongdata/000001.js": new Error("detail failed"),
        "fundgz.1234567.com.cn/js/000001.js": new Error("jsonp failed"),
        "F10DataApi.aspx": historyHtml,
      }),
      timeoutMs: 1000,
    });

    const detail = await provider.getFundDetail("000001");

    expect(detail.source).toBe("eastmoney");
    expect(detail.isMock).toBe(false);
    expect(detail.name).toBe("暂无数据");
    expect(detail.nav).toBe(1.2345);
    expect(detail.navHistory).toHaveLength(1);
  });

  it("真实接口完全失败时才 fallback 到 MockProvider", async () => {
    const primaryProvider = new EastMoneyFundProvider({
      fetcher: createFetchMock({
        "pingzhongdata/510300.js": new Error("detail failed"),
        "fundgz.1234567.com.cn/js/510300.js": new Error("jsonp failed"),
        "F10DataApi.aspx": new Error("history failed"),
      }),
      timeoutMs: 1000,
    });
    const provider = new FallbackFundProvider(
      primaryProvider,
      new MockProvider(),
    );

    const info = await provider.getFundInfo("510300");

    expect(info.source).toBe("mock");
    expect(info.isMock).toBe(true);
    expect(info.name).toBe("沪深300指数增强");
    expect(fundInfoSchema.parse(info)).toEqual(info);
  });

  it("真实接口完全失败且 mock 无该 code 时返回最小模拟详情", async () => {
    const primaryProvider = new EastMoneyFundProvider({
      fetcher: createFetchMock({
        "pingzhongdata/161725.js": new Error("detail failed"),
        "fundgz.1234567.com.cn/js/161725.js": new Error("jsonp failed"),
        "F10DataApi.aspx": new Error("history failed"),
      }),
      timeoutMs: 1000,
    });
    const provider = new FallbackFundProvider(
      primaryProvider,
      new MockProvider(),
    );

    const detail = await provider.getFundDetail("161725");

    expect(detail).toMatchObject({
      code: "161725",
      name: "暂无数据",
      source: "mock",
      isMock: true,
      nav: null,
      accumulatedNav: null,
    });
    expect(detail.navHistory).toEqual([]);
    expect(fundDetailSchema.parse(detail)).toEqual(detail);
  });

  it("诊断能力返回每个上游 URL 的失败状态并识别代理配置", async () => {
    const provider = new EastMoneyFundProvider({
      proxyUrl: "https://proxy.example.test:8080",
      timeoutMs: 1000,
    });

    const diagnostics = await provider.diagnose("161725");

    expect(diagnostics.provider).toBe("eastmoney");
    expect(diagnostics.code).toBe("161725");
    expect(diagnostics.proxyConfigured).toBe(true);
    expect(diagnostics.requests).toHaveLength(3);
    expect(diagnostics.requests.every((request) => request.ok === false)).toBe(
      true,
    );
    expect(diagnostics.fallbackReason).toContain("失败");
    expect(diagnostics.finalSource).toBe("mock");
    expect(diagnostics.finalIsMock).toBe(true);
  });

  it("上游请求 200 但内容不可解析时诊断显示解析失败", async () => {
    const provider = new EastMoneyFundProvider({
      fetcher: createFetchMock({
        "pingzhongdata/161725.js": "<html>error page</html>",
        "fundgz.1234567.com.cn/js/161725.js": "not jsonp",
        "F10DataApi.aspx": "<html>empty</html>",
      }),
      timeoutMs: 1000,
    });

    const diagnostics = await provider.diagnose("161725");

    expect(diagnostics.requests).toHaveLength(3);
    expect(diagnostics.requests[0]).toMatchObject({
      ok: true,
      parse: {
        hasContent: true,
        hasCoreData: false,
      },
    });
    expect(diagnostics.requests[1]).toMatchObject({
      ok: false,
    });
    expect(diagnostics.requests[2]).toMatchObject({
      ok: false,
    });
    expect(diagnostics.parse.coreSignals).toEqual([]);
    expect(diagnostics.parse.errors).toContain("详情脚本响应格式不符合预期");
    expect(diagnostics.eastMoneySuccess).toBe(false);
    expect(diagnostics.finalSource).toBe("mock");
  });

  it("JSONP 请求成功并解析到核心字段时诊断显示 eastmoney 成功", async () => {
    const provider = new EastMoneyFundProvider({
      fetcher: createFetchMock({
        "pingzhongdata/000001.js": "<html>error page</html>",
        "fundgz.1234567.com.cn/js/000001.js": latestNavJsonp,
        "F10DataApi.aspx": "<html>empty</html>",
      }),
      timeoutMs: 1000,
    });

    const diagnostics = await provider.diagnose("000001");

    expect(diagnostics.eastMoneySuccess).toBe(true);
    expect(diagnostics.finalSource).toBe("eastmoney");
    expect(diagnostics.finalIsMock).toBe(false);
    expect(diagnostics.parse.coreSignals).toEqual(
      expect.arrayContaining(["jsonp.code", "name", "nav"]),
    );
    expect(diagnostics.requests[1].parse).toMatchObject({
      hasCode: true,
      hasName: true,
      hasNav: true,
      hasCoreData: true,
    });
  });

  it("四个 mock 接口返回结构均通过 Zod 校验", async () => {
    const provider = new MockProvider();

    const funds = await provider.searchFunds("沪深300");
    const info = await provider.getFundInfo("510300");
    const navHistory = await provider.getFundNavHistory("510300");
    const performance = await provider.getFundPerformance("510300");
    const detail = await provider.getFundDetail("510300");

    expect(fundSearchResultSchema.array().parse(funds)).toEqual(funds);
    expect(fundInfoSchema.parse(info)).toEqual(info);
    expect(fundNavPointSchema.array().parse(navHistory)).toEqual(navHistory);
    expect(fundPerformanceSchema.parse(performance)).toEqual(performance);
    expect(fundDetailSchema.parse(detail)).toEqual(detail);
    expect(funds[0]?.fundSize).toBe("68.20 亿元");
    expect(info.disclaimer).toBe(disclaimer);
    expect(performance.disclaimer).toBe(disclaimer);
  });

  it("支持按基金代码搜索 mock 数据", async () => {
    const provider = new MockProvider();

    const funds = await provider.searchFunds("510300");

    expect(funds).toHaveLength(1);
    expect(funds[0]).toMatchObject({
      code: "510300",
      name: "沪深300指数增强",
      fundSize: "68.20 亿元",
      source: "mock",
      isMock: true,
    });
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

  it("/funds/[code] 页面不直接引用 mock-data", async () => {
    const pageSource = await readFile("app/funds/[code]/page.tsx", "utf8");

    expect(pageSource).not.toContain("mock-data");
    expect(pageSource).not.toContain("MockProvider");
    expect(pageSource).toContain("fundProvider.getFundDetail");
  });
});
