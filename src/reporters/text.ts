import type { Finding, ScanResult } from "../scanner/types.js";
import { createSummary } from "../utils/severity.js";

const severityWidth = 7;

interface TextReporterOptions {
  color?: boolean;
}

const ansi = {
  bold: "\u001B[1m",
  dim: "\u001B[2m",
  red: "\u001B[31m",
  green: "\u001B[32m",
  yellow: "\u001B[33m",
  cyan: "\u001B[36m",
  reset: "\u001B[0m"
};

export function formatText(result: ScanResult, options: TextReporterOptions = {}): string {
  const useColor = options.color ?? supportsColor();
  const colorize = createColorizer(useColor);
  const lines: string[] = [];
  const summary = createSummary(result);

  if (result.errors.length > 0) {
    lines.push(
      colorize(
        `gha-guardian encountered ${result.errors.length} scanner error${result.errors.length === 1 ? "" : "s"}`,
        ansi.red,
        ansi.bold
      )
    );
    lines.push("");
    for (const error of result.errors) {
      const location = error.filePath ? `${error.filePath}${error.line ? `:${error.line}` : ""}` : "scanner";
      lines.push(colorize(location, ansi.bold));
      lines.push(`  ${colorize("ERROR".padEnd(severityWidth), ansi.red, ansi.bold)} ${error.message}`);
      lines.push("");
    }
  }

  if (result.findings.length === 0) {
    if (result.errors.length === 0) {
      lines.push(
        colorize(
          `gha-guardian found no issues in ${summary.filesScanned} workflow file${summary.filesScanned === 1 ? "" : "s"}`,
          ansi.green,
          ansi.bold
        )
      );
    }
    return lines.join("\n").trimEnd();
  }

  lines.push(
    colorize(
      `gha-guardian found ${summary.findings} issue${summary.findings === 1 ? "" : "s"} in ${summary.filesScanned} workflow file${summary.filesScanned === 1 ? "" : "s"}`,
      ansi.yellow,
      ansi.bold
    )
  );
  lines.push("");

  const byFile = groupByFile(result.findings);
  for (const [filePath, findings] of byFile) {
    lines.push(colorize(filePath, ansi.bold));
    lines.push("");

    for (const finding of findings) {
      const location = finding.line ? `:${finding.line}` : "";
      const severity = colorize(finding.severity.padEnd(severityWidth), severityColor(finding.severity), ansi.bold);
      const ruleId = colorize(finding.ruleId, ansi.bold);
      lines.push(`  ${severity} ${ruleId}  ${finding.title}${colorize(location, ansi.dim)}`);
      lines.push(`          ${finding.recommendation}`);
      if (finding.evidence) {
        lines.push(`          ${colorize("Evidence:", ansi.cyan, ansi.bold)} ${colorize(finding.evidence, ansi.dim)}`);
      }
      lines.push("");
    }
  }

  return lines.join("\n").trimEnd();
}

function groupByFile(findings: Finding[]): Map<string, Finding[]> {
  const byFile = new Map<string, Finding[]>();

  for (const finding of findings) {
    const existing = byFile.get(finding.filePath) ?? [];
    existing.push(finding);
    byFile.set(finding.filePath, existing);
  }

  return byFile;
}

function severityColor(severity: Finding["severity"]): string {
  if (severity === "HIGH") {
    return ansi.red;
  }

  if (severity === "MEDIUM") {
    return ansi.yellow;
  }

  return ansi.cyan;
}

function createColorizer(useColor: boolean) {
  return (value: string, ...codes: string[]): string => {
    if (!useColor || codes.length === 0) {
      return value;
    }

    return `${codes.join("")}${value}${ansi.reset}`;
  };
}

function supportsColor(): boolean {
  if (process.env.NO_COLOR || process.env.TERM === "dumb") {
    return false;
  }

  if (process.env.FORCE_COLOR && process.env.FORCE_COLOR !== "0") {
    return true;
  }

  return Boolean(process.stdout.isTTY);
}
