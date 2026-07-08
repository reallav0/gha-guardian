import type { Finding, ScanResult, Severity } from "../scanner/types.js";

export const severityRank: Record<Severity, number> = {
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1
};

export interface Summary {
  filesScanned: number;
  findings: number;
  high: number;
  medium: number;
  low: number;
  errors?: number;
}

export function compareFindings(a: Finding, b: Finding): number {
  const fileCompare = a.filePath.localeCompare(b.filePath);
  if (fileCompare !== 0) {
    return fileCompare;
  }

  const aLine = a.line ?? Number.MAX_SAFE_INTEGER;
  const bLine = b.line ?? Number.MAX_SAFE_INTEGER;
  if (aLine !== bLine) {
    return aLine - bLine;
  }

  const severityCompare = severityRank[b.severity] - severityRank[a.severity];
  if (severityCompare !== 0) {
    return severityCompare;
  }

  return a.ruleId.localeCompare(b.ruleId);
}

export function createSummary(result: ScanResult): Summary {
  const summary: Summary = {
    filesScanned: result.filesScanned,
    findings: result.findings.length,
    high: 0,
    medium: 0,
    low: 0
  };

  for (const finding of result.findings) {
    if (finding.severity === "HIGH") {
      summary.high += 1;
    } else if (finding.severity === "MEDIUM") {
      summary.medium += 1;
    } else {
      summary.low += 1;
    }
  }

  if (result.errors.length > 0) {
    summary.errors = result.errors.length;
  }

  return summary;
}

export function sarifLevel(severity: Severity): "error" | "warning" | "note" {
  if (severity === "HIGH") {
    return "error";
  }

  if (severity === "MEDIUM") {
    return "warning";
  }

  return "note";
}

export function sarifSecuritySeverity(severity: Severity): string {
  if (severity === "HIGH") {
    return "8.0";
  }

  if (severity === "MEDIUM") {
    return "5.0";
  }

  return "2.0";
}
