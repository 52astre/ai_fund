import { NextResponse } from "next/server";
import { z } from "zod";
import { fundProvider } from "@/lib/fund-provider";

const routeParamsSchema = z.object({
  code: z.string().regex(/^\d{6}$/),
});

type FundApiRouteContext = {
  params: Promise<{
    code?: string;
  }>;
};

export async function GET(_request: Request, context: FundApiRouteContext) {
  const parsedParams = routeParamsSchema.safeParse(await context.params);

  if (!parsedParams.success) {
    return NextResponse.json(
      { error: "基金代码必须是 6 位数字" },
      { status: 400 },
    );
  }

  try {
    const detail = await fundProvider.getFundDetail(parsedParams.data.code);

    return NextResponse.json({
      fund: detail,
      source: detail.source,
      isMock: detail.isMock,
      updatedAt: detail.updatedAt,
    });
  } catch {
    return NextResponse.json(
      { error: "未成功获取基金数据，请稍后重试" },
      { status: 404 },
    );
  }
}
