import type { Finding, Rule } from "../scanner/types.js";
import { findLine, findStepValueLine, lineText } from "../utils/yaml-lines.js";
import { createFinding, getString, listSteps } from "./helpers.js";

const remoteScriptPipePattern = /\b(curl|wget)\b[\s\S]*(\|\s*(sudo\s+)?(bash|sh)\b|\|\s*(bash|sh)\b)/i;

export const gha010RemoteScriptExecution: Rule = {
  id: "GHA010",
  title: "Remote script piped to shell",
  severity: "HIGH",
  description: "A workflow command downloads a remote script and pipes it directly into a shell.",
  recommendation:
    "Avoid curl-or-wget pipe-to-shell patterns. Download, pin, verify, and execute trusted release artifacts explicitly.",
  check({ workflow }): Finding[] {
    const findings: Finding[] = [];

    for (const { step } of listSteps(workflow)) {
      const runValue = getString(step.run);
      if (!runValue || !remoteScriptPipePattern.test(runValue)) {
        continue;
      }

      const line =
        findStepValueLine(workflow.content, "run", runValue) ??
        findLine(workflow.content, /\b(curl|wget)\b.*\|.*\b(bash|sh)\b/i);
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
