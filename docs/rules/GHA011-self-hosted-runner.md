# GHA011 - Self-hosted runner usage

## Overview

This rule detects jobs that use `self-hosted` runners.

## Why it matters

Self-hosted runners can retain state and may have access to internal networks, credentials, or privileged infrastructure. They require careful isolation when workflows can be influenced by untrusted contributors.

## Bad example

```yaml
jobs:
  build:
    runs-on: [self-hosted, linux]
```

## Good example

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
```

## Recommendation

Use GitHub-hosted runners for untrusted workflows. If self-hosted runners are required, isolate them, avoid persistent sensitive state, and restrict which workflows can use them.

## Severity

MEDIUM

## References

- [About self-hosted runners](https://docs.github.com/en/actions/hosting-your-own-runners/managing-self-hosted-runners/about-self-hosted-runners)
- [Security hardening for GitHub Actions](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
