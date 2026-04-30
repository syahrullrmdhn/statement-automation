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
