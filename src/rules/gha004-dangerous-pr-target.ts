import type { Finding, Rule } from "../scanner/types.js";
import { findKeyLine, findLine, findStepValueLine, lineText } from "../utils/yaml-lines.js";
import {
  actionNameFromUses,
  createFinding,
  getString,
  hasWorkflowEvent,
  lineForUses,
  listSteps
} from "./helpers.js";

const riskyRunPattern =
  /\b(npm|pnpm|yarn|bun|make|bash|sh|python|python3|pip|pytest|go test|cargo|gradle|mvn|ruby|bundle|composer)\b|\.\/|source\s+/i;

export const gha004DangerousPrTarget: Rule = {
  id: "GHA004",
  title: "Dangerous pull_request_target usage",
  severity: "HIGH",
  description: "pull_request_target can expose repository secrets and write tokens to untrusted pull request code when used unsafely.",
  recommendation:
    "Use pull_request for untrusted code, avoid checking out or executing attacker-controlled code in pull_request_target, and isolate privileged operations.",
  check({ workflow }): Finding[] {
    if (!hasWorkflowEvent(workflow, "pull_request_target")) {
      return [];
    }

    const findings: Finding[] = [];
    const triggerLine =
      findLine(workflow.content, /^\s*on\s*:\s*pull_request_target\s*$/) ??
      findLine(workflow.content, /^\s*pull_request_target\s*:/) ??
      findKeyLine(workflow.content, "on");

    findings.push(
      createFinding(this, workflow, {
        line: triggerLine,
        evidence: lineText(workflow.content, triggerLine)
      })
    );

    for (const { step } of listSteps(workflow)) {
      const usesValue = getString(step.uses);
      if (usesValue && actionNameFromUses(usesValue) === "actions/checkout") {
        const line = lineForUses(workflow, usesValue);
        findings.push(
          createFinding(this, workflow, {
            title: "pull_request_target checks out repository code",
            description:
              "The workflow combines pull_request_target with actions/checkout, which can be dangerous if pull request code is checked out or executed.",
            line,
            evidence: lineText(workflow.content, line)
          })
        );
      }

      const runValue = getString(step.run);
      if (runValue && riskyRunPattern.test(runValue)) {
        const line =
          findStepValueLine(workflow.content, "run", runValue) ??
          findLine(workflow.content, /^\s*run\s*:/);
        findings.push(
          createFinding(this, workflow, {
            title: "pull_request_target runs potentially untrusted code",
            description:
              "The workflow combines pull_request_target with shell commands that appear to install, build, test, or execute repository code.",
            line,
            evidence: lineText(workflow.content, line)
          })
        );
      }
    }

    return findings;
  }
};
