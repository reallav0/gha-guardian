# GHA005 — Secrets used in pull request workflows

## Overview

This rule detects `pull_request` workflows that reference `${{ secrets.NAME }}`.

## Why it matters

Pull requests can contain untrusted code. Exposing secrets to pull request workflows can leak credentials or tokens if the workflow design is unsafe.

## Bad example

```yaml
on: pull_request

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: npm test -- --token "${{ secrets.NPM_TOKEN }}"
```

## Good example

```yaml
on: pull_request

permissions:
  contents: read

jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - run: npm test
```

## Recommendation

Avoid secrets in workflows triggered by untrusted pull requests. Use safer trigger design, protected environments, or separate privileged workflows that do not execute pull request code.

## Severity

HIGH

## References

- [Using secrets in GitHub Actions](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)
- [Security hardening for GitHub Actions](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
