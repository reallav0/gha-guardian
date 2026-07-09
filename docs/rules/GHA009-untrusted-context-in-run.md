# GHA009 - Untrusted GitHub context in shell commands

## Overview

This rule detects shell commands that interpolate GitHub event fields commonly controlled by pull request, issue, comment, or review authors.

## Why it matters

Untrusted text inserted directly into shell commands can become command injection. Pull request titles, issue bodies, comments, review bodies, and branch names can contain shell metacharacters.

## Bad example

```yaml
steps:
  - run: echo "${{ github.event.pull_request.title }}"
```

## Good example

```yaml
steps:
  - env:
      PR_TITLE: ${{ github.event.pull_request.title }}
    run: |
      printf '%s\n' "$PR_TITLE"
```

## Recommendation

Do not interpolate untrusted GitHub context directly into shell commands. Pass values through environment variables, quote them, and validate before use.

## Severity

HIGH

## References

- [Security hardening for GitHub Actions: script injections](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions#understanding-the-risk-of-script-injections)
- [GitHub Actions contexts](https://docs.github.com/en/actions/learn-github-actions/contexts)
