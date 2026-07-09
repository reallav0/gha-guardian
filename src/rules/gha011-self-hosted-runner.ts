import type { Finding, Rule } from "../scanner/types.js";
import { findJobLine, lineText } from "../utils/yaml-lines.js";
import { createFinding, listJobs } from "./helpers.js";

export const gha011SelfHostedRunner: Rule = {
  id: "GHA011",
  title: "Self-hosted runner used",
  severity: "MEDIUM",
  description:
    "The workflow runs a job on a self-hosted runner, which can be risky for public repositories and untrusted pull request code.",
  recommendation:
    "Use GitHub-hosted runners for untrusted workflows, or isolate self-hosted runners so they cannot access sensitive networks, credentials, or persistent state.",
  check({ workflow }): Finding[] {
    const findings: Finding[] = [];

    for (const { id, job } of listJobs(workflow)) {
      if (!runsOnSelfHosted(job["runs-on"])) {
        continue;
      }

      const line = findJobLine(workflow.content, id);
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

function runsOnSelfHosted(value: unknown): boolean {
  if (typeof value === "string") {
    return value === "self-hosted";
  }

  if (Array.isArray(value)) {
    return value.some((item) => typeof item === "string" && item === "self-hosted");
  }

  return false;
}
