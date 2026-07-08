import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

async function createRepo(workflowContent: string): Promise<string> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "gha-guardian-cli-"));
  const workflowPath = path.join(root, ".github/workflows/test.yml");
  await fs.mkdir(path.dirname(workflowPath), { recursive: true });
  await fs.writeFile(workflowPath, workflowContent, "utf8");
  return root;
}

function runCli(args: string[]) {
  const tsxCli = path.join(process.cwd(), "node_modules", "tsx", "dist", "cli.mjs");
  return spawnSync(process.execPath, [tsxCli, "src/cli.ts", ...args], {
    cwd: process.cwd(),
    encoding: "utf8"
  });
}

describe("CLI", () => {
  it("exits with 0 for clean scans, 1 for findings, and 2 for scanner errors", async () => {
    const cleanRepo = await createRepo(`
name: clean
on: push
permissions:
  contents: read
jobs:
  build:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: ./.github/actions/local
`);
    const vulnerableRepo = await createRepo(`
name: vulnerable
on: push
permissions: write-all
jobs:
  build:
    runs-on: ubuntu-latest
    steps: []
`);
    const invalidRepo = await createRepo("name: [broken\n");

    const clean = runCli(["scan", "--path", cleanRepo, "--format", "json"]);
    const vulnerable = runCli(["scan", "--path", vulnerableRepo, "--format", "json"]);
    const invalid = runCli(["scan", "--path", invalidRepo, "--format", "json"]);

    expect(clean.status).toBe(0);
    expect(JSON.parse(clean.stdout).summary.findings).toBe(0);

    expect(vulnerable.status).toBe(1);
    expect(JSON.parse(vulnerable.stdout).summary.findings).toBeGreaterThan(0);

    expect(invalid.status).toBe(2);
    expect(JSON.parse(invalid.stdout).errors[0].message).toContain("Invalid YAML");
  });
});
