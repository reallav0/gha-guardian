import fs from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";
import type { DiscoveredWorkflow } from "./types.js";

function toPosixPath(value: string): string {
  return value.split(path.sep).join("/");
}

function relativeDisplayPath(cwd: string, absolutePath: string): string {
  const relative = path.relative(cwd, absolutePath);
  return toPosixPath(relative || absolutePath);
}

export async function discoverWorkflows(scanPath = ".", cwd = process.cwd()): Promise<DiscoveredWorkflow[]> {
  const absoluteScanPath = path.resolve(cwd, scanPath);
  let stats;

  try {
    stats = await fs.stat(absoluteScanPath);
  } catch {
    throw new Error(`Path does not exist: ${scanPath}`);
  }

  if (stats.isFile()) {
    const ext = path.extname(absoluteScanPath).toLowerCase();
    if (ext !== ".yml" && ext !== ".yaml") {
      throw new Error(`Path is not a YAML workflow file: ${scanPath}`);
    }

    return [
      {
        absolutePath: absoluteScanPath,
        filePath: relativeDisplayPath(cwd, absoluteScanPath)
      }
    ];
  }

  if (!stats.isDirectory()) {
    throw new Error(`Path is not a directory or YAML workflow file: ${scanPath}`);
  }

  const isWorkflowDirectory =
    path.basename(absoluteScanPath) === "workflows" && path.basename(path.dirname(absoluteScanPath)) === ".github";
  const patterns = isWorkflowDirectory
    ? ["*.yml", "*.yaml"]
    : [".github/workflows/*.yml", ".github/workflows/*.yaml"];

  const entries = await fg(patterns, {
    cwd: absoluteScanPath,
    absolute: true,
    onlyFiles: true,
    dot: true,
    unique: true,
    caseSensitiveMatch: false
  });

  return entries
    .map((entry) => path.resolve(entry))
    .sort((a, b) => a.localeCompare(b))
    .map((absolutePath) => ({
      absolutePath,
      filePath: relativeDisplayPath(cwd, absolutePath)
    }));
}
