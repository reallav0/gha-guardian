# GHA006 — Missing `timeout-minutes`

## Overview

Jobs should define `timeout-minutes` to avoid unbounded runtime.

## Why it matters

Missing timeouts can waste CI minutes, block runners, and make abuse or accidental infinite loops more expensive.

## Bad example

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: npm test
```

## Good example

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - run: npm test
```

## Recommendation

Set a reasonable timeout for every job based on expected runtime.

## Severity

LOW

## References

- [GitHub Actions workflow syntax: jobs.job_id.timeout-minutes](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idtimeout-minutes)
