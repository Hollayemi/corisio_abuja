import type { PromotionStatus } from "@/redux/types";

const STYLES: Record<PromotionStatus, { label: string; className: string }> = {
  ACTIVE: { label: "ACTIVE", className: "bg-[#e7f4e4] text-corisio-blue" },
  SCHEDULED: { label: "SCHEDULED", className: "bg-[#fdf0da] text-amber-700" },
  INACTIVE: { label: "INACTIVE", className: "bg-neutral-100 text-neutral-600" },
  EXPIRED: { label: "EXPIRED", className: "bg-neutral-200 text-neutral-600" },
  PAUSED: { label: "PAUSED", className: "bg-[#fdf0da] text-amber-700" },
};

export function PromotionStatusPill({ status }: { status: PromotionStatus }) {
  const s = STYLES[status];
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${s.className}`}>
      {s.label}
    </span>
  );
}
