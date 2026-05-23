const disclaimer = "不构成投资建议，仅供个人分析参考";

export default function AnalysisPage() {
  return (
    <main className="min-h-screen px-6 py-10">
      <section className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-semibold tracking-normal text-slate-950">
          投资分析
        </h1>
        <p className="mt-4 text-slate-600">
          当前里程碑仅预留页面，不生成投资建议。
        </p>
        <p className="mt-6 border-l-4 border-amber-500 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
          {disclaimer}
        </p>
      </section>
    </main>
  );
}
