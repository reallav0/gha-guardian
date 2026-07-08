# GHA002 — Require explicit top-level `permissions`

## Overview

Workflows should define a top-level `permissions` block so the default `GITHUB_TOKEN` scope is intentional and easy to review.

## Why it matters

Implicit token permissions depend on repository and organization defaults. Explicit permissions make workflow access predictable.

## Bad example

```yaml
name: ci
on: push

jobs:
  test:
    runs-on: ubuntu-latest
```

## Good example

```yaml
permissions:
  contents: read
```

## Recommendation

Add an explicit top-level permissions block. Prefer `contents: read` for normal CI jobs.

## Severity

MEDIUM

## References

- [GitHub Actions workflow syntax: permissions](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#permissions)
- [Automatic token authentication](https://docs.github.com/en/actions/security-guides/automatic-token-authentication)
