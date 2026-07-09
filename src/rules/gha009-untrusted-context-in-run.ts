import type { Finding, Rule } from "../scanner/types.js";
import { findLine, findStepValueLine, lineText } from "../utils/yaml-lines.js";
import { createFinding, getString, listSteps } from "./helpers.js";

const untrustedContextPattern =
  /\$\{\{\s*(github\.head_ref|github\.event\.(pull_request\.(title|body|head\.ref)|issue\.(title|body)|comment\.body|review\.body))\s*}}/i;

export const gha009UntrustedContextInRun: Rule = {
  id: "GHA009",
  title: "Untrusted GitHub context used in shell command",
  severity: "HIGH",
  description:
    "A shell command interpolates GitHub event data that can be controlled by an issue, comment, review, or pull request author.",
  recommendation:
    "Do not interpolate untrusted GitHub context directly into shell commands. Pass values through environment variables, quote them, and validate before use.",
  check({ workflow }): Finding[] {
    const findings: Finding[] = [];

    for (const { step } of listSteps(workflow)) {
      const runValue = getString(step.run);
      if (!runValue || !untrustedContextPattern.test(runValue)) {
        continue;
      }

      const line =
        findStepValueLine(workflow.content, "run", runValue) ??
        findLine(workflow.content, /\$\{\{\s*(github\.head_ref|github\.event\.)/);
      findings.push(
        createFinding(this, workflow, {
          line,
          evidence: lineText(workflow.content, line)
        })
      );
    }

    return findings;
  }
};
