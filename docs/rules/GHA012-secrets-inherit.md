# GHA012 - Reusable workflow inherits all secrets

## Overview

This rule detects reusable workflow calls that use `secrets: inherit`.

## Why it matters

`secrets: inherit` passes every caller-visible secret to the reusable workflow. That can make it harder to audit which credentials a workflow can access and increases blast radius if the callee is changed or compromised.

## Bad example

```yaml
jobs:
  deploy:
    uses: org/repo/.github/workflows/deploy.yml@main
    secrets: inherit
```

## Good example

```yaml
jobs:
  deploy:
    uses: org/repo/.github/workflows/deploy.yml@0123456789abcdef0123456789abcdef01234567
    secrets:
      deploy_token: ${{ secrets.DEPLOY_TOKEN }}
```

## Recommendation

Pass only the specific secrets required by the reusable workflow, and pin the reusable workflow reference when it is outside the current repository.

## Severity

MEDIUM

## References

- [Reusing workflows](https://docs.github.com/en/actions/using-workflows/reusing-workflows)
- [Using secrets in GitHub Actions](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)
