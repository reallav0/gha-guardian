# Threat model

## Scope

`gha-guardian` focuses on static analysis of GitHub Actions workflow YAML files. It looks for risky CI/CD patterns that can increase the impact of compromised pull requests, mutable third-party actions, overprivileged tokens, and leaked long-lived credentials.

## In-scope risks

- `GITHUB_TOKEN` permissions that are broader than required.
- Workflows that run untrusted pull request code with privileged triggers.
- Third-party actions referenced by mutable tags or branches.
- Secrets referenced from pull request workflows.
- Missing job runtime limits.
- Long-lived cloud credential secret names.

## Out of scope

- Full data-flow analysis of shell scripts.
- Runtime behavior of third-party actions.
- Verification that a pinned SHA belongs to a trusted release.
- Repository, organization, or environment policy inspection through the GitHub API.
- Automatic remediation.

## Assumptions

- Workflow files are available locally.
- Approximate line numbers are acceptable for initial triage.
- A finding is a security review prompt, not proof of exploitability.

## Design goals

- Fail clearly on malformed YAML.
- Avoid silently skipping broken workflow files.
- Keep rules deterministic and easy to test.
- Produce machine-readable output for automation and SARIF for GitHub code scanning.
