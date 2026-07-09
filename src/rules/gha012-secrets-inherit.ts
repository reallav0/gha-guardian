import type { Finding, Rule } from "../scanner/types.js";
import { findAllLines, lineText } from "../utils/yaml-lines.js";
import { createFinding } from "./helpers.js";

const secretsInheritPattern = /^\s*secrets\s*:\s*inherit\s*$/g;

export const gha012SecretsInherit: Rule = {
  id: "GHA012",
  title: "Reusable workflow inherits all secrets",
  severity: "MEDIUM",
  description: "A reusable workflow call uses secrets: inherit, making every caller-visible secret available to the callee.",
  recommendation: "Pass only the specific secrets required by the reusable workflow instead of using secrets: inherit.",
  check({ workflow }): Finding[] {
    return findAllLines(workflow.content, secretsInheritPattern).map((line) =>
      createFinding(this, workflow, {
        line,
        evidence: lineText(workflow.content, line)
      })
    );
  }
};
