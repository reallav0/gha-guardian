# GHA004 — Dangerous `pull_request_target` usage

## Overview

`pull_request_target` runs in the context of the base repository. It can access privileged tokens and secrets in situations where `pull_request` would be more restricted.

## Why it matters

If a workflow checks out or executes untrusted pull request code under `pull_request_target`, attacker-controlled code can run with elevated repository privileges.

## Bad example

```yaml
on: pull_request_target

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm test
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
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683
      - run: npm test
```

## Recommendation

Use `pull_request` for untrusted code. If `pull_request_target` is required for labels or comments, isolate that privileged operation and avoid checking out or executing pull request code.

## Severity

HIGH

## References

- [GitHub Actions workflow syntax: pull_request_target](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#pull_request_target)
- [Security hardening for GitHub Actions](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
