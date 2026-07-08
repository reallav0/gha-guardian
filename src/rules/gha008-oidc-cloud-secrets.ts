import type { Finding, Rule } from "../scanner/types.js";
import { findLine, lineText } from "../utils/yaml-lines.js";
import { createFinding, getString } from "./helpers.js";

const cloudCredentialNames = [
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "GOOGLE_APPLICATION_CREDENTIALS",
  "GCP_SERVICE_ACCOUNT_KEY",
  "AZURE_CLIENT_SECRET"
];

export const gha008OidcCloudSecrets: Rule = {
  id: "GHA008",
  title: "Long-lived cloud credential secret detected",
  severity: "MEDIUM",
  description: "The workflow references a secret name commonly used for long-lived cloud credentials.",
  recommendation: "Prefer GitHub Actions OIDC federation for cloud authentication instead of long-lived credentials.",
  check({ workflow }): Finding[] {
    const findings: Finding[] = [];

    for (const credentialName of cloudCredentialNames) {
      if (!workflow.content.includes(credentialName)) {
        continue;
      }

      const line = findLine(workflow.content, credentialName);
      findings.push(
        createFinding(this, workflow, {
          line,
          evidence: lineText(workflow.content, line),
          description: `The workflow references ${credentialName}, which is commonly used as a long-lived cloud credential.`
        })
      );
    }

    return dedupeFindings(findings);
  }
};

function dedupeFindings(findings: Finding[]): Finding[] {
  const seen = new Set<string>();
  return findings.filter((finding) => {
    const key = `${finding.filePath}:${finding.line}:${getString(finding.evidence) ?? ""}`;
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}
