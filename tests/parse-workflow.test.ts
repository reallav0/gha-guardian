import { describe, expect, it } from "vitest";
import { parseWorkflowContent, WorkflowParseError } from "../src/scanner/parse-workflow.js";
import { scanWorkflows } from "../src/scanner/scan.js";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

describe("parseWorkflowContent", () => {
  it("does not crash on empty workflow files", () => {
    const workflow = parseWorkflowContent(".github/workflows/empty.yml", "/tmp/empty.yml", "");

    expect(workflow.data).toEqual({});
  });

  it("throws a clear parse error for invalid YAML", () => {
    expect(() =>
      parseWorkflowContent(".github/workflows/bad.yml", "/tmp/bad.yml", "name: [broken\n")
    ).toThrow(WorkflowParseError);
  });
});

describe("scanWorkflows", () => {
  it("handles invalid YAML gracefully as a scanner error", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "gha-guardian-invalid-"));
    const workflowPath = path.join(root, ".github/workflows/bad.yml");
    await fs.mkdir(path.dirname(workflowPath), { recursive: true });
    await fs.writeFile(workflowPath, "name: [broken\n", "utf8");

    const result = await scanWorkflows({ path: root });

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.message).toContain("Invalid YAML");
  });
});
