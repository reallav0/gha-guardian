import type { Document } from "yaml";

export type Severity = "LOW" | "MEDIUM" | "HIGH";

export interface Finding {
  ruleId: string;
  title: string;
  severity: Severity;
  description: string;
  recommendation: string;
  filePath: string;
  line?: number;
  evidence?: string;
}

export interface ScannerError {
  filePath?: string;
  line?: number;
  message: string;
}

export interface ParsedWorkflow {
  filePath: string;
  absolutePath: string;
  content: string;
  data: Record<string, unknown>;
  document: Document.Parsed;
}

export interface RuleContext {
  workflow: ParsedWorkflow;
}

export interface Rule {
  id: string;
  title: string;
  severity: Severity;
  description: string;
  recommendation: string;
  check(context: RuleContext): Finding[];
}

export interface DiscoveredWorkflow {
  absolutePath: string;
  filePath: string;
}

export interface ScanOptions {
  path?: string;
  cwd?: string;
  rules?: Rule[];
}

export interface ScanResult {
  filesScanned: number;
  scannedFiles: string[];
  findings: Finding[];
  errors: ScannerError[];
}
