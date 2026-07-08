#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { Command } from "commander";
import { allRules } from "./rules/index.js";
import { formatJson } from "./reporters/json.js";
import { formatSarif } from "./reporters/sarif.js";
import { formatText } from "./reporters/text.js";
import { scanWorkflows } from "./scanner/scan.js";
import type { ScanResult } from "./scanner/types.js";

const require = createRequire(import.meta.url);
const packageJson = require("../package.json") as { version: string };

type OutputFormat = "text" | "json" | "sarif";

export async function runCli(argv = process.argv): Promise<void> {
  const program = new Command();

  program
    .name("gha-guardian")
    .description("A security scanner for GitHub Actions workflows.")
    .version(packageJson.version, "-v, --version", "print version");

  program
    .command("scan")
    .description("scan GitHub Actions workflow files")
    .option("--path <path>", "repository root, workflow directory, or workflow file to scan", ".")
    .option("--format <format>", "output format: text, json, or sarif", "text")
    .option("--output <file>", "write report output to a file")
    .action(async (options: { path: string; format: string; output?: string }) => {
      const format = parseFormat(options.format);
      const result = await scanWorkflows({ path: options.path });
      const output = render(format, result);

      if (options.output) {
        await writeReport(options.output, output);
        console.log(`gha-guardian wrote ${format} report to ${options.output}`);
      } else {
        console.log(output);
      }

      process.exitCode = exitCodeForResult(result);
    });

  program
    .command("rules")
    .description("list supported security rules")
    .action(() => {
      for (const rule of allRules) {
        console.log(`${rule.id}  ${rule.severity.padEnd(6)}  ${rule.title}`);
      }
    });

  program
    .command("version")
    .description("print version")
    .action(() => {
      console.log(packageJson.version);
    });

  await program.parseAsync(argv);
}

function parseFormat(format: string): OutputFormat {
  if (format === "text" || format === "json" || format === "sarif") {
    return format;
  }

  throw new Error(`Unsupported format "${format}". Expected text, json, or sarif.`);
}

function render(format: OutputFormat, result: ScanResult): string {
  if (format === "json") {
    return formatJson(result);
  }

  if (format === "sarif") {
    return formatSarif(result);
  }

  return formatText(result);
}

async function writeReport(outputPath: string, output: string): Promise<void> {
  const absolutePath = path.resolve(process.cwd(), outputPath);
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, `${output}\n`, "utf8");
}

function exitCodeForResult(result: ScanResult): number {
  if (result.errors.length > 0) {
    return 2;
  }

  if (result.findings.length > 0) {
    return 1;
  }

  return 0;
}

runCli().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`gha-guardian error: ${message}`);
  process.exitCode = 2;
});
