import type { Finding, Rule } from "../scanner/types.js";
import { findJobLine, findLine, lineText } from "../utils/yaml-lines.js";
import { createFinding, isRecord, listJobs } from "./helpers.js";

const broadWritePermissions = [
  "contents",
  "actions",
  "checks",
  "deployments",
  "issues",
  "packages",
  "pull-requests",
  "security-events",
  "statuses"
] as const;

function collectBroadWrites(permissions: unknown): string[] {
  if (!isRecord(permissions)) {
    return [];
  }

  return broadWritePermissions.filter((permission) => permissions[permission] === "write");
}

export const gha007BroadPermissions: Rule = {
  id: "GHA007",
  title: "Broad write permissions granted",
  severity: "MEDIUM",
  description: "The workflow grants broad write permissions to the GitHub token.",
  recommendation: "Use the narrowest permissions required by the workflow or move privileged operations into isolated jobs.",
  check({ workflow }): Finding[] {
    const findings: Finding[] = [];

    for (const permission of collectBroadWrites(workflow.data.permissions)) {
      const line = findLine(workflow.content, new RegExp(`^\\s*${permission}\\s*:\\s*write\\s*$`));
      findings.push(
        createFinding(this, workflow, {
          line,
          evidence: lineText(workflow.content, line),
          description: `The workflow grants ${permission}: write.`
        })
      );
    }

    for (const { id, job } of listJobs(workflow)) {
      for (const permission of collectBroadWrites(job.permissions)) {
        const line =
          findLine(workflow.content, new RegExp(`^\\s*${permission}\\s*:\\s*write\\s*$`)) ??
          findJobLine(workflow.content, id);
        findings.push(
          createFinding(this, workflow, {
            line,
            evidence: lineText(workflow.content, line),
            description: `The job "${id}" grants ${permission}: write.`
          })
        );
      }
    }

    return findings;
  }
};
