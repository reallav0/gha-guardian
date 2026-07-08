import type { Finding, Rule } from "../scanner/types.js";
import {
  createFinding,
  getString,
  isDockerAction,
  isLocalAction,
  isPinnedToFullSha,
  lineForUses,
  listSteps
} from "./helpers.js";
import { lineText } from "../utils/yaml-lines.js";

export const gha003PinActions: Rule = {
  id: "GHA003",
  title: "Action is not pinned to a commit SHA",
  severity: "MEDIUM",
  description: "A workflow step uses an action reference that is not pinned to a full commit SHA.",
  recommendation: "Pin actions to a full 40-character commit SHA instead of a tag or branch.",
  check({ workflow }): Finding[] {
    const findings: Finding[] = [];

    for (const { step } of listSteps(workflow)) {
      const usesValue = getString(step.uses);
      if (!usesValue || isLocalAction(usesValue) || isDockerAction(usesValue)) {
        continue;
      }

      if (isPinnedToFullSha(usesValue)) {
        continue;
      }

      const line = lineForUses(workflow, usesValue);
      findings.push(
        createFinding(this, workflow, {
          line,
          evidence: lineText(workflow.content, line),
          recommendation: `${usesValue} should be pinned to a full commit SHA for stronger supply-chain integrity.`
        })
      );
    }

    return findings;
  }
};
