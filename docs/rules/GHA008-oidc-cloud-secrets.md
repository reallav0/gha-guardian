# GHA008 — Use OIDC instead of long-lived cloud credentials

## Overview

This rule detects references to secret names commonly used for long-lived cloud credentials, including AWS, Google Cloud, and Azure credentials.

## Why it matters

Long-lived cloud credentials can be leaked, reused, and difficult to rotate. GitHub Actions OIDC federation lets workflows request short-lived cloud credentials without storing static keys as repository secrets.

## Bad example

```yaml
steps:
  - run: echo "${{ secrets.AWS_ACCESS_KEY_ID }}"
  - run: echo "${{ secrets.AWS_SECRET_ACCESS_KEY }}"
```

## Good example

```yaml
permissions:
  contents: read
  id-token: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - run: echo "Exchange GitHub OIDC token for short-lived cloud credentials"
```

## Recommendation

Prefer GitHub Actions OIDC federation for cloud authentication. If static credentials remain necessary, scope them tightly and rotate them regularly.

## Severity

MEDIUM

## References

- [OpenID Connect in GitHub Actions](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
- [Configuring OpenID Connect in cloud providers](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-cloud-providers)
