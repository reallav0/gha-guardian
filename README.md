# gha-guardian

> A security scanner for GitHub Actions workflows - find risky CI/CD patterns before attackers do.

[![CI](https://github.com/reallav0/gha-guardian/actions/workflows/ci.yml/badge.svg)](https://github.com/reallav0/gha-guardian/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/gha-guardian.svg)](https://www.npmjs.com/package/gha-guardian)
[![npm downloads](https://img.shields.io/npm/dm/gha-guardian.svg)](https://www.npmjs.com/package/gha-guardian)
[![license](https://img.shields.io/npm/l/gha-guardian.svg)](LICENSE)

`gha-guardian` is a CLI-first security scanner for `.github/workflows/*.yml` and `.yaml` files. It helps maintainers find risky GitHub Actions patterns such as broad token permissions, unsafe `pull_request_target` workflows, unpinned third-party actions, missing job timeouts, and long-lived cloud credential secrets.

## Why this project exists

GitHub Actions workflows are part of the software supply chain. A risky workflow can expose repository secrets, grant write tokens to attacker-controlled code, or pull mutable third-party action code during a privileged build. `gha-guardian` gives open-source projects a small, fast scanner that is easy to run locally, in CI, and as a GitHub Action.

## Installation

View the published package on npm: [gha-guardian](https://www.npmjs.com/package/gha-guardian).

```bash
npm install -g gha-guardian
```

Or run without installing:

```bash
npx gha-guardian scan
```

## Quick start

```bash
gha-guardian scan
gha-guardian scan --path .
gha-guardian scan --format text
gha-guardian scan --format json
gha-guardian scan --format sarif --output gha-guardian.sarif
```

By default, the scanner looks for:

```txt
.github/workflows/*.yml
.github/workflows/*.yaml
```

Exit codes:

| Code | Meaning |
| --- | --- |
| `0` | No issues found |
| `1` | Issues found |
| `2` | Scanner error, invalid path, invalid YAML, or unexpected failure |

## Example output

```txt
gha-guardian found 5 issues in 2 workflow files

.github/workflows/deploy.yml

  HIGH    GHA001  Workflow grants write-all permissions:7
          Use least-privilege permissions instead of permissions: write-all.
          Evidence: permissions: write-all

  MEDIUM  GHA003  Action is not pinned to a commit SHA:13
          actions/checkout@v4 should be pinned to a full commit SHA for stronger supply-chain integrity.
          Evidence: - uses: actions/checkout@v4
```

## Supported rules

| Rule | Severity | Description |
| --- | --- | --- |
| [GHA001](docs/rules/GHA001-no-write-all.md) | HIGH | Avoid `permissions: write-all` |
| [GHA002](docs/rules/GHA002-require-permissions.md) | MEDIUM | Require explicit top-level `permissions` |
| [GHA003](docs/rules/GHA003-pin-actions.md) | MEDIUM | Pin third-party actions to a full commit SHA |
| [GHA004](docs/rules/GHA004-dangerous-pr-target.md) | HIGH | Detect dangerous `pull_request_target` usage |
| [GHA005](docs/rules/GHA005-secrets-in-pr.md) | HIGH | Detect secrets in `pull_request` workflows |
| [GHA006](docs/rules/GHA006-timeout-minutes.md) | LOW | Require `timeout-minutes` on jobs |
| [GHA007](docs/rules/GHA007-broad-permissions.md) | MEDIUM | Detect broad write permissions |
| [GHA008](docs/rules/GHA008-oidc-cloud-secrets.md) | MEDIUM | Prefer OIDC over long-lived cloud credentials |

## CLI usage

```bash
gha-guardian scan
gha-guardian scan --path .
gha-guardian scan --path .github/workflows/ci.yml
gha-guardian scan --format json
gha-guardian scan --format sarif --output results.sarif
gha-guardian rules
gha-guardian version
```

## GitHub Action usage

```yaml
name: gha-guardian

on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read
  security-events: write

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: reallav0/gha-guardian@v1
        with:
          path: "."
          format: "sarif"
          output: "gha-guardian.sarif"
```

### SARIF upload example

```yaml
      - name: Upload SARIF
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: gha-guardian.sarif
```

## Rule documentation

Each rule has examples and remediation guidance:

- [GHA001 - Avoid `permissions: write-all`](docs/rules/GHA001-no-write-all.md)
- [GHA002 - Require explicit top-level `permissions`](docs/rules/GHA002-require-permissions.md)
- [GHA003 - Pin third-party actions](docs/rules/GHA003-pin-actions.md)
- [GHA004 - Dangerous `pull_request_target` usage](docs/rules/GHA004-dangerous-pr-target.md)
- [GHA005 - Secrets used in pull request workflows](docs/rules/GHA005-secrets-in-pr.md)
- [GHA006 - Missing `timeout-minutes`](docs/rules/GHA006-timeout-minutes.md)
- [GHA007 - Broad job permissions](docs/rules/GHA007-broad-permissions.md)
- [GHA008 - Use OIDC instead of long-lived cloud credentials](docs/rules/GHA008-oidc-cloud-secrets.md)

## Development setup

```bash
pnpm install
pnpm build
pnpm test
pnpm lint
pnpm dev scan --path examples/vulnerable
```

Useful scripts:

```bash
pnpm scan:examples
pnpm test:watch
pnpm format
```

## Roadmap

- Suppression comments with required justification.
- Config file support for severity overrides and rule selection.
- More precise YAML AST line mapping.
- Additional rules for artifact poisoning, cache poisoning, and script injection.
- Prebuilt bundled GitHub Action release artifact.

See [docs/roadmap.md](docs/roadmap.md).

## Contributing

Issues and pull requests are welcome. Start with [docs/contributing.md](docs/contributing.md), run the test suite before opening a PR, and include tests for rule behavior changes.

## License

MIT. See [LICENSE](LICENSE).
