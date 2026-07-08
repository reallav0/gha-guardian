import type { Finding, Rule } from "../scanner/types.js";
import { findJobLine, findKeyLine, findLine, lineText } from "../utils/yaml-lines.js";
import { createFinding, listJobs } from "./helpers.js";

export const gha001NoWriteAll: Rule = {
  id: "GHA001",
  title: "Workflow grants write-all permissions",
  severity: "HIGH",
  description: "The workflow grants every available GitHub token permission write access.",
  recommendation: "Use least-privilege permissions instead of permissions: write-all.",
  check({ workflow }): Finding[] {
    const findings: Finding[] = [];

    if (workflow.data.permissions === "write-all") {
      const line =
        findLine(workflow.content, /^\s*permissions\s*:\s*write-all\s*$/) ??
        findKeyLine(workflow.content, "permissions");
      findings.push(
        createFinding(this, workflow, {
          line,
          evidence: lineText(workflow.content, line)
        })
      );
    }

    for (const { id, job } of listJobs(workflow)) {
      if (job.permissions !== "write-all") {
        continue;
      }

      const line =
        findLine(workflow.content, /^\s*permissions\s*:\s*write-all\s*$/) ??
        findJobLine(workflow.content, id);
      findings.push(
        createFinding(this, workflow, {
          title: "Job grants write-all permissions",
          description: `The job "${id}" grants every available GitHub token permission write access.`,
          line,
          evidence: lineText(workflow.content, line)
        })
      );
    }

    return findings;
  }
};
