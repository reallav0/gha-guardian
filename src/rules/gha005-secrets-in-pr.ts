import type { Finding, Rule } from "../scanner/types.js";
import { findAllLines, lineText } from "../utils/yaml-lines.js";
import { createFinding, hasWorkflowEvent } from "./helpers.js";

const secretsPattern = /\$\{\{\s*secrets\.[A-Za-z_][A-Za-z0-9_]*\s*}}/g;

export const gha005SecretsInPr: Rule = {
  id: "GHA005",
  title: "Secrets used in pull request workflow",
  severity: "HIGH",
  description: "The workflow is triggered by pull_request and references GitHub Actions secrets.",
  recommendation:
    "Avoid exposing secrets to workflows triggered by untrusted pull requests. Use safer trigger design and environment protection.",
  check({ workflow }): Finding[] {
    if (!hasWorkflowEvent(workflow, "pull_request")) {
      return [];
    }

    return findAllLines(workflow.content, secretsPattern).map((line) =>
      createFinding(this, workflow, {
        line,
        evidence: lineText(workflow.content, line)
      })
    );
  }
};
