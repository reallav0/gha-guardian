import type { Finding, Rule } from "../scanner/types.js";
import { createFinding } from "./helpers.js";

export const gha002RequirePermissions: Rule = {
  id: "GHA002",
  title: "Workflow is missing explicit top-level permissions",
  severity: "MEDIUM",
  description: "The workflow does not define default top-level permissions for the GitHub token.",
  recommendation: "Add explicit default permissions, for example permissions: { contents: read }.",
  check({ workflow }): Finding[] {
    if (Object.prototype.hasOwnProperty.call(workflow.data, "permissions")) {
      return [];
    }

    return [
      createFinding(this, workflow, {
        line: 1,
        evidence: "missing top-level permissions"
      })
    ];
  }
};
