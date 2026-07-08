# GHA007 — Broad job permissions

## Overview

This rule detects workflow-level or job-level permissions that grant broad write access, such as `contents: write`, `actions: write`, or `pull-requests: write`.

## Why it matters

Write permissions increase impact when a workflow step, dependency, or action is compromised. Privileged permissions should be narrow and isolated.

## Bad example

```yaml
permissions:
  contents: write
  pull-requests: write
```

## Good example

```yaml
permissions:
  contents: read

jobs:
  release:
    permissions:
      contents: write
```

## Recommendation

Use read-only defaults and grant write permissions only to trusted jobs that require them.

## Severity

MEDIUM

## References

- [GitHub Actions workflow syntax: permissions](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#permissions)
- [Automatic token authentication](https://docs.github.com/en/actions/security-guides/automatic-token-authentication)
