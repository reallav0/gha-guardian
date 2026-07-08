export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function findLine(content: string, pattern: string | RegExp): number | undefined {
  const lines = content.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? "";
    if (typeof pattern === "string") {
      if (line.includes(pattern)) {
        return index + 1;
      }
    } else if (pattern.test(line)) {
      return index + 1;
    }
  }

  return undefined;
}

export function findAllLines(content: string, pattern: RegExp): number[] {
  const lines = content.split(/\r?\n/);
  const matches: number[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    pattern.lastIndex = 0;
    if (pattern.test(lines[index] ?? "")) {
      matches.push(index + 1);
    }
  }

  return matches;
}

export function findKeyLine(content: string, key: string): number | undefined {
  return findLine(content, new RegExp(`^\\s*${escapeRegExp(key)}\\s*:`));
}

export function findStepValueLine(content: string, key: string, value: string): number | undefined {
  const quotedValue = `["']?${escapeRegExp(value)}["']?`;
  return findLine(content, new RegExp(`^\\s*${escapeRegExp(key)}\\s*:\\s*${quotedValue}\\s*$`));
}

export function findJobLine(content: string, jobId: string): number | undefined {
  const lines = content.split(/\r?\n/);
  let inJobs = false;
  let jobsIndent = -1;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? "";
    const trimmed = line.trim();

    if (!inJobs) {
      const jobsMatch = /^(\s*)jobs\s*:/.exec(line);
      if (jobsMatch) {
        inJobs = true;
        jobsIndent = jobsMatch[1]?.length ?? 0;
      }
      continue;
    }

    if (trimmed === "" || trimmed.startsWith("#")) {
      continue;
    }

    const indent = line.length - line.trimStart().length;
    if (indent <= jobsIndent) {
      break;
    }

    const jobMatch = new RegExp(`^\\s{${jobsIndent + 1},}${escapeRegExp(jobId)}\\s*:`).exec(line);
    if (jobMatch) {
      return index + 1;
    }
  }

  return findLine(content, new RegExp(`^\\s*${escapeRegExp(jobId)}\\s*:`));
}

export function lineText(content: string, line?: number): string | undefined {
  if (!line || line < 1) {
    return undefined;
  }

  return content.split(/\r?\n/)[line - 1]?.trim();
}
