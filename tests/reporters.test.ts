import { describe, expect, it } from "vitest";
import { formatJson } from "../src/reporters/json.js";
import { formatSarif } from "../src/reporters/sarif.js";
import { formatText } from "../src/reporters/text.js";
import type { ScanResult } from "../src/scanner/types.js";

const result: ScanResult = {
  filesScanned: 1,
  scannedFiles: [".github/workflows/test.yml"],
  errors: [],
  findings: [
    {
      ruleId: "GHA001",
      title: "Workflow grants write-all permissions",
      severity: "HIGH",
      description: "The workflow grants write-all.",
      recommendation: "Use least privilege.",
      filePath: ".github/workflows/test.yml",
      line: 3,
      evidence: "permissions: write-all"
    }
  ]
};

describe("reporters", () => {
  it("JSON reporter returns valid JSON", () => {
    const json = JSON.parse(formatJson(result)) as {
      summary: { filesScanned: number; findings: number; high: number };
      findings: unknown[];
    };

    expect(json.summary.filesScanned).toBe(1);
    expect(json.summary.findings).toBe(1);
    expect(json.summary.high).toBe(1);
    expect(json.findings).toHaveLength(1);
  });

  it("SARIF reporter returns a SARIF-like structure", () => {
    const sarif = JSON.parse(formatSarif(result)) as {
      version: string;
      runs: Array<{ tool: { driver: { rules: unknown[] } }; results: unknown[] }>;
    };

    expect(sarif.version).toBe("2.1.0");
    expect(sarif.runs[0]?.tool.driver.rules.length).toBeGreaterThan(0);
    expect(sarif.runs[0]?.results).toHaveLength(1);
  });

  it("text reporter can colorize warnings for terminal output", () => {
    const firstFinding = result.findings[0];
    if (!firstFinding) {
      throw new Error("expected test fixture to include a finding");
    }

    const colored = formatText(result, { color: true });
    const warning = formatText(
      {
        ...result,
        findings: [{ ...firstFinding, severity: "MEDIUM" }]
      },
      { color: true }
    );
    const plain = formatText(result, { color: false });

    expect(colored).toContain("\u001B[31m");
    expect(warning).toContain("\u001B[33m");
    expect(colored).toContain("\u001B[1m");
    expect(plain).not.toContain("\u001B[31m");
  });
});
