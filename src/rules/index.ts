import { gha001NoWriteAll } from "./gha001-no-write-all.js";
import { gha002RequirePermissions } from "./gha002-require-permissions.js";
import { gha003PinActions } from "./gha003-pin-actions.js";
import { gha004DangerousPrTarget } from "./gha004-dangerous-pr-target.js";
import { gha005SecretsInPr } from "./gha005-secrets-in-pr.js";
import { gha006TimeoutMinutes } from "./gha006-timeout-minutes.js";
import { gha007BroadPermissions } from "./gha007-broad-permissions.js";
import { gha008OidcCloudSecrets } from "./gha008-oidc-cloud-secrets.js";
import { gha009UntrustedContextInRun } from "./gha009-untrusted-context-in-run.js";
import { gha010RemoteScriptExecution } from "./gha010-remote-script-execution.js";
import { gha011SelfHostedRunner } from "./gha011-self-hosted-runner.js";
import { gha012SecretsInherit } from "./gha012-secrets-inherit.js";

export const allRules = [
  gha001NoWriteAll,
  gha002RequirePermissions,
  gha003PinActions,
  gha004DangerousPrTarget,
  gha005SecretsInPr,
  gha006TimeoutMinutes,
  gha007BroadPermissions,
  gha008OidcCloudSecrets,
  gha009UntrustedContextInRun,
  gha010RemoteScriptExecution,
  gha011SelfHostedRunner,
  gha012SecretsInherit
] as const;

export {
  gha001NoWriteAll,
  gha002RequirePermissions,
  gha003PinActions,
  gha004DangerousPrTarget,
  gha005SecretsInPr,
  gha006TimeoutMinutes,
  gha007BroadPermissions,
  gha008OidcCloudSecrets,
  gha009UntrustedContextInRun,
  gha010RemoteScriptExecution,
  gha011SelfHostedRunner,
  gha012SecretsInherit
};
