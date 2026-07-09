# GHA010 - Remote script piped to shell

## Overview

This rule detects commands that download a remote script with `curl` or `wget` and pipe it directly to `bash` or `sh`.

## Why it matters

Pipe-to-shell install commands execute remote content immediately. If the endpoint, DNS, TLS trust chain, or script content is compromised, the workflow executes attacker-controlled code.

## Bad example

```yaml
steps:
  - run: curl -fsSL https://example.com/install.sh | bash
```

## Good example

```yaml
steps:
  - run: |
      curl -fsSLO https://example.com/tool-v1.2.3-linux-amd64.tar.gz
      echo "expected-sha256  tool-v1.2.3-linux-amd64.tar.gz" | sha256sum -c -
      tar -xzf tool-v1.2.3-linux-amd64.tar.gz
```

## Recommendation

Download pinned release artifacts, verify checksums or signatures, and execute only reviewed content.

## Severity

HIGH

## References

- [Security hardening for GitHub Actions](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
- [OpenSSF Scorecard: Dangerous-Workflow](https://github.com/ossf/scorecard/blob/main/docs/checks.md#dangerous-workflow)
