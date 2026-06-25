/** Format an ISO date (e.g. "2026-06-22") as a short editorial stamp like "Jun 2026". */
export function formatMonthYear(iso: string | undefined | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
