import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { discoverWorkflows } from "../src/scanner/discover-workflows.js";

async function createTempRepo(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), "gha-guardian-"));
}

async function writeFile(filePath: string, content: string): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, "utf8");
}

describe("discoverWorkflows", () => {
  it("finds .yml and .yaml workflow files", async () => {
    const root = await createTempRepo();
    await writeFile(path.join(root, ".github/workflows/a.yml"), "name: a\n");
    await writeFile(path.join(root, ".github/workflows/b.yaml"), "name: b\n");
    await writeFile(path.join(root, ".github/workflows/not-a-workflow.txt"), "ignored\n");

    const workflows = await discoverWorkflows(".", root);

    expect(workflows.map((workflow) => workflow.filePath)).toEqual([
      ".github/workflows/a.yml",
      ".github/workflows/b.yaml"
    ]);
  });
});
