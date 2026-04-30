export function matchesStatementPeriod(
  fileName: string,
  year: string,
  month: string
) {
  const compact = `${year}${month}`;
  const dotted = `${year}.${month}`;

  return (
    fileName.toLowerCase().endsWith(".zip") &&
    (fileName.includes(compact) || fileName.includes(dotted))
  );
}

export function buildStatementFileName(account: string) {
  return `${account}_mail.htm`;
}