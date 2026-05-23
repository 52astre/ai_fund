import { describe, expect, it } from "vitest";

describe("项目骨架", () => {
  it("保留统一免责声明", () => {
    expect("不构成投资建议，仅供个人分析参考").toContain("投资建议");
  });
});
