# GHA003 — Pin third-party actions to a full commit SHA

## Overview

Third-party actions should be pinned to a full 40-character commit SHA instead of a mutable tag or branch.

## Why it matters

Tags and branches can move. Pinning to a commit SHA gives stronger supply-chain integrity because the workflow runs the exact action revision that was reviewed.

## Bad example

```yaml
steps:
  - uses: actions/checkout@v4
  - uses: docker/login-action@v3
  - uses: some-user/some-action@main
```

## Good example

```yaml
steps:
  - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683
```

Local actions are not flagged:

```yaml
steps:
  - uses: ./.github/actions/my-action
```

## Recommendation

Pin third-party actions to a reviewed full commit SHA and update intentionally through dependency automation or regular maintenance.

## Severity

MEDIUM

## References

- [Security hardening for GitHub Actions: pin actions to a full length commit SHA](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions#using-third-party-actions)
- [GitHub Actions workflow syntax: jobs.job_id.steps.uses](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idstepsuses)
