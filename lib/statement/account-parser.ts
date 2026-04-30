export function extractAccountsFromText(input: string) {
  const matches = input.match(/\b\d{6,10}\b/g) || [];
  const unique = Array.from(new Set(matches));
  return unique;
}
