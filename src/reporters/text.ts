import type { Finding, ScanResult } from "../scanner/types.js";
import { createSummary } from "../utils/severity.js";

const severityWidth = 7;

export function formatText(result: ScanResult): string {
  const lines: string[] = [];
  const summary = createSummary(result);

  if (result.errors.length > 0) {
    lines.push(`gha-guardian encountered ${result.errors.length} scanner error${result.errors.length === 1 ? "" : "s"}`);
    lines.push("");
    for (const error of result.errors) {
      const location = error.filePath ? `${error.filePath}${error.line ? `:${error.line}` : ""}` : "scanner";
      lines.push(`${location}`);
      lines.push(`  ERROR   ${error.message}`);
      lines.push("");
    }
  }

  if (result.findings.length === 0) {
    if (result.errors.length === 0) {
      lines.push(`gha-guardian found no issues in ${summary.filesScanned} workflow file${summary.filesScanned === 1 ? "" : "s"}`);
    }
    return lines.join("\n").trimEnd();
  }

  lines.push(
    `gha-guardian found ${summary.findings} issue${summary.findings === 1 ? "" : "s"} in ${summary.filesScanned} workflow file${summary.filesScanned === 1 ? "" : "s"}`
  );
  lines.push("");

  const byFile = groupByFile(result.findings);
  for (const [filePath, findings] of byFile) {
    lines.push(filePath);
    lines.push("");

    for (const finding of findings) {
      const location = finding.line ? `:${finding.line}` : "";
      lines.push(`  ${finding.severity.padEnd(severityWidth)} ${finding.ruleId}  ${finding.title}${location}`);
      lines.push(`          ${finding.recommendation}`);
      if (finding.evidence) {
        lines.push(`          Evidence: ${finding.evidence}`);
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
