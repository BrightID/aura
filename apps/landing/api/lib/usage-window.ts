/** A count of 90 is today and the 89 UTC days before it. */
export function usageWindow(now = new Date(), days = 90): string[] {
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(start);
    day.setUTCDate(start.getUTCDate() - i);
    dates.push(day.toISOString().slice(0, 10));
  }
  return dates;
}

export function usageDay(value: unknown): string | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }
  return null;
}
