import { describe, expect, it } from "vitest";
import { parseWorkflowContent } from "../src/scanner/parse-workflow.js";
import type { Rule } from "../src/scanner/types.js";
import {
  gha001NoWriteAll,
  gha002RequirePermissions,
  gha003PinActions,
  gha004DangerousPrTarget,
  gha005SecretsInPr,
  gha006TimeoutMinutes,
  gha007BroadPermissions,
  gha008OidcCloudSecrets
} from "../src/rules/index.js";

function check(rule: Rule, content: string) {
  const workflow = parseWorkflowContent(".github/workflows/test.yml", "/tmp/test.yml", content);
  return rule.check({ workflow });
}

describe("rules", () => {
  it("GHA001 detects permissions: write-all", () => {
    const findings = check(
      gha001NoWriteAll,
      `
name: test
on: push
permissions: write-all
jobs:
  build:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps: []
`
    );

    expect(findings).toHaveLength(1);
    expect(findings[0]?.ruleId).toBe("GHA001");
  });

  it("GHA002 detects missing top-level permissions", () => {
    const findings = check(
      gha002RequirePermissions,
      `
name: test
on: push
jobs:
  build:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps: []
`
    );

    expect(findings).toHaveLength(1);
  });

  it("GHA003 detects unpinned actions", () => {
    const findings = check(
      gha003PinActions,
      `
name: test
on: push
permissions:
  contents: read
jobs:
  build:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
      - uses: docker/login-action@v3
`
    );

    expect(findings).toHaveLength(2);
  });

  it("GHA003 ignores local actions", () => {
    const findings = check(
      gha003PinActions,
      `
name: test
on: push
permissions:
  contents: read
jobs:
  build:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: ./.github/actions/my-action
`
    );

    expect(findings).toHaveLength(0);
  });

  it("GHA004 detects pull_request_target", () => {
    const findings = check(
      gha004DangerousPrTarget,
      `
name: test
on: pull_request_target
permissions:
  contents: read
jobs:
  build:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
      - run: npm test
`
    );

    expect(findings.some((finding) => finding.ruleId === "GHA004")).toBe(true);
    expect(findings.length).toBeGreaterThanOrEqual(2);
  });

  it("GHA005 detects secrets in pull request workflows", () => {
    const findings = check(
      gha005SecretsInPr,
      `
name: test
on: pull_request
permissions:
  contents: read
jobs:
  build:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - run: echo "\${{ secrets.NPM_TOKEN }}"
`
    );

    expect(findings).toHaveLength(1);
  });

  it("GHA006 detects missing job timeouts", () => {
    const findings = check(
      gha006TimeoutMinutes,
      `
name: test
on: push
permissions:
  contents: read
jobs:
  build:
    runs-on: ubuntu-latest
    steps: []
`
    );

    expect(findings).toHaveLength(1);
  });

  it("GHA007 detects broad write permissions", () => {
    const findings = check(
      gha007BroadPermissions,
      `
name: test
on: push
permissions:
  contents: write
  checks: write
jobs:
  build:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps: []
`
    );

    expect(findings).toHaveLength(2);
  });

  it("GHA008 detects cloud credential secrets", () => {
    const findings = check(
      gha008OidcCloudSecrets,
      `
name: test
on: push
permissions:
  contents: read
jobs:
  deploy:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - run: echo "\${{ secrets.AWS_ACCESS_KEY_ID }}"
`
    );

    expect(findings).toHaveLength(1);
    expect(findings[0]?.ruleId).toBe("GHA008");
  });
});
