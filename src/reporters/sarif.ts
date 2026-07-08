import { allRules } from "../rules/index.js";
import type { Rule, ScanResult } from "../scanner/types.js";
import { sarifLevel, sarifSecuritySeverity } from "../utils/severity.js";

export function formatSarif(result: ScanResult, rules: readonly Rule[] = allRules): string {
  return JSON.stringify(
    {
      $schema: "https://json.schemastore.org/sarif-2.1.0.json",
      version: "2.1.0",
      runs: [
        {
          tool: {
            driver: {
              name: "gha-guardian",
              informationUri: "https://github.com/nguyend-nhatnguyen/gha-guardian",
              rules: rules.map((rule) => ({
                id: rule.id,
                name: rule.title,
                shortDescription: {
                  text: rule.title
                },
                fullDescription: {
                  text: rule.description
                },
                help: {
                  text: rule.recommendation
                },
                helpUri: `https://github.com/nguyend-nhatnguyen/gha-guardian/blob/main/docs/rules/${rule.id}-${ruleSlug(rule)}.md`,
                properties: {
                  precision: "medium",
                  securitySeverity: sarifSecuritySeverity(rule.severity),
                  tags: ["security", "github-actions"]
                }
              }))
            }
          },
          results: result.findings.map((finding) => ({
            ruleId: finding.ruleId,
            level: sarifLevel(finding.severity),
            message: {
              text: finding.recommendation
            },
            locations: [
              {
                physicalLocation: {
                  artifactLocation: {
                    uri: finding.filePath.replaceAll("\\", "/")
                  },
                  region: {
                    startLine: finding.line ?? 1
                  }
                }
              }
            ],
            properties: {
              title: finding.title,
              severity: finding.severity,
              evidence: finding.evidence
            }
          }))
        }
      ]
    },
    null,
    2
  );
}

function ruleSlug(rule: Rule): string {
  const slug = rule.id === "GHA001"
    ? "no-write-all"
    : rule.id === "GHA002"
      ? "require-permissions"
      : rule.id === "GHA003"
        ? "pin-actions"
        : rule.id === "GHA004"
          ? "dangerous-pr-target"
          : rule.id === "GHA005"
            ? "secrets-in-pr"
            : rule.id === "GHA006"
              ? "timeout-minutes"
              : rule.id === "GHA007"
                ? "broad-permissions"
                : "oidc-cloud-secrets";
  return slug;
}
