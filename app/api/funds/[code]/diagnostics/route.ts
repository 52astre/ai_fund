import { NextResponse } from "next/server";
import { z } from "zod";
import { getFundProviderDiagnostics } from "@/lib/fund-provider";

const routeParamsSchema = z.object({
  code: z.string().regex(/^\d{6}$/),
});

type FundDiagnosticsRouteContext = {
  params: Promise<{
    code?: string;
  }>;
};

export async function GET(_request: Request, context: FundDiagnosticsRouteContext) {
  const parsedParams = routeParamsSchema.safeParse(await context.params);

  if (!parsedParams.success) {
    return NextResponse.json(
      { error: "基金代码必须是 6 位数字" },
      { status: 400 },
    );
  }

  try {
    const diagnostics = await getFundProviderDiagnostics(parsedParams.data.code);

    return NextResponse.json(diagnostics);
  } catch (error) {
    const message = error instanceof Error ? error.message : "诊断失败";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
