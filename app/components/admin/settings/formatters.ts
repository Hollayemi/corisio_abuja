import type { AdminTeamStatus } from "@/redux/types/adminSettings";

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
const pad = (n: number) => String(n).padStart(2, "0");

function toDate(iso?: string | null) {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** "5:07PM" style clock with no space, as on the Sessions list. */
function compactClock(date: Date) {
  const h = date.getHours();
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${pad(date.getMinutes())}${h >= 12 ? "PM" : "AM"}`;
}

/** "17 Aug 2026" / "08 Sept 2026" */
export function formatDayMonthYear(iso?: string | null) {
  const date = toDate(iso);
  if (!date) return "";
  return `${pad(date.getDate())} ${MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}`;
}

/** "Sept 12 - 12:34PM" */
export function formatSessionTime(iso?: string | null) {
  const date = toDate(iso);
  if (!date) return "";
  return `${MONTHS_SHORT[date.getMonth()]} ${date.getDate()} - ${compactClock(date)}`;
}

/** "Sep 21, 2026 · 2:18 AM". "Never" when they haven't signed in yet. */
export function formatLastActive(iso?: string | null) {
  const date = toDate(iso);
  if (!date) return "Never";
  const day = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${day} · ${time}`;
}

export const TEAM_STATUS_LABELS: Record<AdminTeamStatus, string> = {
  active: "Active",
  invited: "Invited",
  suspended: "Suspended",
};

export const TEAM_STATUS_STYLES: Record<AdminTeamStatus, string> = {
  active: "bg-[#e7f4e4] text-corisio-blue",
  invited: "bg-[#fdf0dc] text-amber-700",
  suspended: "bg-[#fbe9e9] text-red-600",
};

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const MIN_PASSWORD_LENGTH = 8;
