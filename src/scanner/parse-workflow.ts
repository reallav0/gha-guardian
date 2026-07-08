import fs from "node:fs/promises";
import { parseDocument } from "yaml";
import type { DiscoveredWorkflow, ParsedWorkflow } from "./types.js";
import { isRecord } from "../utils/object.js";

export class WorkflowParseError extends Error {
  readonly filePath: string;
  readonly line?: number;

  constructor(filePath: string, message: string, line?: number) {
    super(message);
    this.name = "WorkflowParseError";
    this.filePath = filePath;
    this.line = line;
  }
}

export function parseWorkflowContent(
  filePath: string,
  absolutePath: string,
  content: string
): ParsedWorkflow {
  const document = parseDocument(content, {
    prettyErrors: false,
    strict: true
  });

  if (document.errors.length > 0) {
    const firstError = document.errors[0];
    throw new WorkflowParseError(
      filePath,
      `Invalid YAML: ${firstError?.message ?? "failed to parse workflow"}`,
      extractYamlErrorLine(firstError)
    );
  }

  const parsed = document.toJS() as unknown;
  const data = isRecord(parsed) ? parsed : {};

  return {
    filePath,
    absolutePath,
    content,
    data,
    document
  };
}

export async function parseWorkflow(workflow: DiscoveredWorkflow): Promise<ParsedWorkflow> {
  const content = await fs.readFile(workflow.absolutePath, "utf8");
  return parseWorkflowContent(workflow.filePath, workflow.absolutePath, content);
}

function extractYamlErrorLine(error: unknown): number | undefined {
  if (!isRecord(error)) {
    return undefined;
  }

  const linePos = error.linePos;
  if (Array.isArray(linePos) && isRecord(linePos[0]) && typeof linePos[0].line === "number") {
    return linePos[0].line;
  }

  return undefined;
}
