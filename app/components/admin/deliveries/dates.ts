/**
 * Calendar date helpers. Dates travel as plain "YYYY-MM-DD" strings (see
 * redux/types/adminDeliveries.ts), so none of this goes through UTC.
 */

export const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const pad = (n: number) => String(n).padStart(2, "0");

/** A local Date -> "2026-09-13". */
export function toDateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** "2026-09-13" -> a local Date at midday (safe from DST edges). */
export function fromDateKey(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d, 12);
}

export function todayKey() {
  return toDateKey(new Date());
}

/** First day of the month containing `key`, as a key. */
export function startOfMonthKey(key: string) {
  const [y, m] = key.split("-").map(Number);
  return `${y}-${pad(m)}-01`;
}

/** "2026-09-xx" -> "2026-10-01" (n = 1) or "2026-08-01" (n = -1). */
export function addMonthsKey(key: string, n: number) {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 1 + n, 1, 12);
  return toDateKey(d);
}

/** Same month? Compares "YYYY-MM". */
export function isSameMonth(a: string, b: string) {
  return a.slice(0, 7) === b.slice(0, 7);
}

/** "September 2026" */
export function monthLabel(key: string) {
  const [y, m] = key.split("-").map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}

/** "September 13, 2026" */
export function longDateLabel(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

/** 1 -> "1st", 2 -> "2nd", 13 -> "13th", 22 -> "22nd" */
export function ordinal(n: number) {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1: return `${n}st`;
    case 2: return `${n}nd`;
    case 3: return `${n}rd`;
    default: return `${n}th`;
  }
}

/** "13th September" */
export function dayAndMonthLabel(key: string) {
  const [, m, d] = key.split("-").map(Number);
  return `${ordinal(d)} ${MONTHS[m - 1]}`;
}

/**
 * The 42 days (6 weeks, Sunday first) shown for the month containing `key`,
 * including the greyed days of the neighbouring months.
 */
export function monthGrid(key: string) {
  const first = fromDateKey(startOfMonthKey(key));
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());

  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return toDateKey(d);
  });
}

/** Last day of the month containing `key`. */
export function endOfMonthKey(key: string) {
  const [y, m] = key.split("-").map(Number);
  return toDateKey(new Date(y, m, 0, 12));
}
