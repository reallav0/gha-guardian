import type { Finding, ParsedWorkflow, Rule } from "../scanner/types.js";
import { isRecord } from "../utils/object.js";
import { escapeRegExp, findLine, findStepValueLine } from "../utils/yaml-lines.js";

export interface JobEntry {
  id: string;
  job: Record<string, unknown>;
}

export interface StepEntry {
  index: number;
  step: Record<string, unknown>;
  jobId: string;
}

export { isRecord };

export function getOnValue(workflow: ParsedWorkflow): unknown {
  if (Object.prototype.hasOwnProperty.call(workflow.data, "on")) {
    return workflow.data.on;
  }

  // Some YAML parsers historically treated "on" as a boolean-like key.
  if (Object.prototype.hasOwnProperty.call(workflow.data, "true")) {
    return workflow.data.true;
  }

  return undefined;
}

export function eventValueIncludes(value: unknown, eventName: string): boolean {
  if (typeof value === "string") {
    return value === eventName;
  }

  if (Array.isArray(value)) {
    return value.some((item) => eventValueIncludes(item, eventName));
  }

  if (isRecord(value)) {
    return Object.prototype.hasOwnProperty.call(value, eventName);
  }

  return false;
}

export function hasWorkflowEvent(workflow: ParsedWorkflow, eventName: string): boolean {
  if (eventValueIncludes(getOnValue(workflow), eventName)) {
    return true;
  }

  const escaped = escapeRegExp(eventName);
  return Boolean(
    findLine(workflow.content, new RegExp(`^\\s*on\\s*:\\s*(?:\\[.*\\b${escaped}\\b.*\\]|${escaped}\\s*)$`)) ??
      findLine(workflow.content, new RegExp(`^\\s*-\\s*${escaped}\\s*$`)) ??
      findLine(workflow.content, new RegExp(`^\\s*${escaped}\\s*:`))
  );
}

export function listJobs(workflow: ParsedWorkflow): JobEntry[] {
  if (!isRecord(workflow.data.jobs)) {
    return [];
  }

  return Object.entries(workflow.data.jobs)
    .filter((entry): entry is [string, Record<string, unknown>] => isRecord(entry[1]))
    .map(([id, job]) => ({ id, job }));
}

export function listSteps(workflow: ParsedWorkflow): StepEntry[] {
  const steps: StepEntry[] = [];

  for (const { id, job } of listJobs(workflow)) {
    if (!Array.isArray(job.steps)) {
      continue;
    }

    for (let index = 0; index < job.steps.length; index += 1) {
      const step = job.steps[index];
      if (isRecord(step)) {
        steps.push({ index, step, jobId: id });
      }
    }
  }

  return steps;
}

export function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export function isLocalAction(usesValue: string): boolean {
  return usesValue === "." || usesValue.startsWith("./") || usesValue.startsWith("../");
}

export function isDockerAction(usesValue: string): boolean {
  return usesValue.startsWith("docker://");
}

export function isPinnedToFullSha(usesValue: string): boolean {
  const ref = usesValue.split("@").pop();
  return typeof ref === "string" && /^[a-fA-F0-9]{40}$/.test(ref);
}

export function actionNameFromUses(usesValue: string): string {
  return usesValue.split("@")[0] ?? usesValue;
}

export function lineForUses(workflow: ParsedWorkflow, usesValue: string): number | undefined {
  return (
    findStepValueLine(workflow.content, "uses", usesValue) ??
    findLine(workflow.content, new RegExp(`uses\\s*:\\s*["']?${escapeRegExp(usesValue)}["']?`))
  );
}

export function createFinding(rule: Rule, workflow: ParsedWorkflow, overrides: Partial<Finding>): Finding {
  return {
    ruleId: rule.id,
    title: rule.title,
    severity: rule.severity,
    description: rule.description,
    recommendation: rule.recommendation,
    filePath: workflow.filePath,
    ...overrides
  };
}
