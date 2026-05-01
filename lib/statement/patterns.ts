export function matchesStatementPeriod(
  fileName: string,
  year: string,
  month: string
) {
  const lower = fileName.toLowerCase();

  if (!lower.endsWith(".zip") && !lower.endsWith(".htm")) {
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

/**
 * Extract date from filename like "89468126_01-04-26.htm"
 * Returns YYYY-MM-DD string or null if not found
 */
export function extractDateFromFileName(fileName: string): string | null {
  // Match pattern: DD-MM-YY or DD-MM-YYYY
  const match = fileName.match(/(\d{2})-(\d{2})-(\d{2,4})/i);
  if (!match) return null;

  const [, day, month, yearPart] = match;
  let year = yearPart;

  // Convert 2-digit year to 4-digit
  if (yearPart.length === 2) {
    const yy = parseInt(yearPart, 10);
    year = yy >= 50 ? `20${yearPart}` : `20${yearPart}`;
  }

  return `${year}-${month}-${day}`;
}

/**
 * Check if a file's date falls within the given range
 */
export function matchesStatementDateRange(
  fileName: string,
  fromDate: string, // YYYY-MM-DD
  toDate: string   // YYYY-MM-DD
): boolean {
  const fileDate = extractDateFromFileName(fileName);
  if (!fileDate) return false;

  // Also check if file ends with .zip (old format)
  if (!fileName.toLowerCase().endsWith(".zip") && !fileName.toLowerCase().endsWith(".htm")) {
    return false;
  }

  return fileDate >= fromDate && fileDate <= toDate;
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
