import { allRules } from "../rules/index.js";
import { compareFindings } from "../utils/severity.js";
import { discoverWorkflows } from "./discover-workflows.js";
import { parseWorkflow, WorkflowParseError } from "./parse-workflow.js";
import type { Rule, ScanOptions, ScanResult, ScannerError } from "./types.js";

export async function scanWorkflows(options: ScanOptions = {}): Promise<ScanResult> {
  const cwd = options.cwd ?? process.cwd();
  const scanPath = options.path ?? ".";
  const rules: readonly Rule[] = options.rules ?? allRules;

  let workflows;
  try {
    workflows = await discoverWorkflows(scanPath, cwd);
  } catch (error) {
    return {
      filesScanned: 0,
      scannedFiles: [],
      findings: [],
      errors: [toScannerError(error)]
    };
  }

  const result: ScanResult = {
    filesScanned: workflows.length,
    scannedFiles: workflows.map((workflow) => workflow.filePath),
    findings: [],
    errors: []
  };

  for (const workflow of workflows) {
    let parsedWorkflow;

    try {
      parsedWorkflow = await parseWorkflow(workflow);
    } catch (error) {
      result.errors.push(toScannerError(error, workflow.filePath));
      continue;
    }

    for (const rule of rules) {
      try {
        result.findings.push(...rule.check({ workflow: parsedWorkflow }));
      } catch (error) {
        result.errors.push(
          toScannerError(error, parsedWorkflow.filePath, `Rule ${rule.id} failed while scanning workflow`)
        );
      }
    }
  }

  result.findings.sort(compareFindings);
  return result;
}

function toScannerError(error: unknown, filePath?: string, prefix?: string): ScannerError {
  if (error instanceof WorkflowParseError) {
    return {
      filePath: error.filePath,
      line: error.line,
      message: error.message
    };
  }

  const message = error instanceof Error ? error.message : String(error);
  return {
    filePath,
    message: prefix ? `${prefix}: ${message}` : message
  };
}
