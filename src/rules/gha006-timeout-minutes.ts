import type { Finding, Rule } from "../scanner/types.js";
import { findJobLine, lineText } from "../utils/yaml-lines.js";
import { createFinding, listJobs } from "./helpers.js";

export const gha006TimeoutMinutes: Rule = {
  id: "GHA006",
  title: "Job is missing timeout-minutes",
  severity: "LOW",
  description: "A job does not define timeout-minutes, allowing runaway jobs to consume CI minutes indefinitely.",
  recommendation: "Add a reasonable timeout to every job, for example timeout-minutes: 15.",
  check({ workflow }): Finding[] {
    return listJobs(workflow)
      .filter(({ job }) => !Object.prototype.hasOwnProperty.call(job, "timeout-minutes"))
      .map(({ id }) => {
        const line = findJobLine(workflow.content, id);
        return createFinding(this, workflow, {
          line,
          evidence: lineText(workflow.content, line),
          description: `The job "${id}" does not define timeout-minutes.`
        });
      });
  }
};
