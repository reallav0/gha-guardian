# GHA001 — Avoid `permissions: write-all`

## Overview

`permissions: write-all` grants broad write access to the `GITHUB_TOKEN`.

## Why it matters

If a workflow step is compromised, a write-all token can modify repository contents, create releases, write packages, update checks, or interact with pull requests depending on repository settings.

## Bad example

```yaml
permissions: write-all
```

## Good example

```yaml
permissions:
  contents: read
```

## Recommendation

Use least-privilege permissions. Start with `contents: read`, then add only the specific write permission a trusted job needs.

## Severity

HIGH

## References

- [GitHub Actions workflow syntax: permissions](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#permissions)
- [Security hardening for GitHub Actions](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
