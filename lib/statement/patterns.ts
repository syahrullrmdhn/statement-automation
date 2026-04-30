export function matchesStatementPeriod(
  fileName: string,
  year: string,
  month: string
) {
  const lower = fileName.toLowerCase();

  if (!lower.endsWith(".zip")) {
    return false;
  }

  const compact = `${year}${month}`;
  const dotted = `${year}.${month}`;

  const hasCompact = lower.includes(compact);
  const hasDotted = lower.includes(dotted);

  if (hasCompact || hasDotted) {
    return true;
  }

  const monthPattern = new RegExp(`^${year}[.-]?${month}[.-]?\\d{2}`);
  return monthPattern.test(lower);
}

export function buildStatementFileName(account: string) {
  return `${account}_mail.htm`;
}

export function extractStatementDateToken(fileNameOrKey: string) {
  const compactMatch = fileNameOrKey.match(/(\d{8})/);
  if (compactMatch) {
    return compactMatch[1];
  }

  const dottedMatch = fileNameOrKey.match(/(\d{4})\.(\d{2})\.(\d{2})/);
  if (dottedMatch) {
    return `${dottedMatch[1]}${dottedMatch[2]}${dottedMatch[3]}`;
  }

  return null;
}
