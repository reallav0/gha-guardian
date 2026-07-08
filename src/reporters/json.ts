import type { ScanResult } from "../scanner/types.js";
import { createSummary } from "../utils/severity.js";

export function formatJson(result: ScanResult): string {
  return JSON.stringify(
    {
      summary: createSummary(result),
      findings: result.findings,
      errors: result.errors
    },
    null,
    2
  );
}
