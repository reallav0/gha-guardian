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
              informationUri: "https://github.com/reallav0/gha-guardian",
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
                helpUri: `https://github.com/reallav0/gha-guardian/blob/main/docs/rules/${rule.id}-${ruleSlug(rule)}.md`,
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
  const slugs: Record<string, string> = {
    GHA001: "no-write-all",
    GHA002: "require-permissions",
    GHA003: "pin-actions",
    GHA004: "dangerous-pr-target",
    GHA005: "secrets-in-pr",
    GHA006: "timeout-minutes",
    GHA007: "broad-permissions",
    GHA008: "oidc-cloud-secrets",
    GHA009: "untrusted-context-in-run",
    GHA010: "remote-script-execution",
    GHA011: "self-hosted-runner",
    GHA012: "secrets-inherit"
  };

  return slugs[rule.id] ?? rule.id.toLowerCase();
}
