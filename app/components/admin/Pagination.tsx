"use client";

import AdminIcon from "@/app/components/admin/layout/AdminIcon";

const PAGE_SIZE_OPTIONS = [8, 20, 50, 100];

/** "Showing 1-8 of 486" + per-page select + prev/next, for any paginated table. */
export function Pagination({
  page,
  perPage,
  total,
  onPageChange,
  onPerPageChange,
}: {
  page: number;
  perPage: number;
  total: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const from = total === 0 ? 0 : (page - 1) * perPage + 1 || 1;
  const to = Math.min(page * perPage, total) || 1;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 pt-5">
      <p className="text-sm text-neutral-500">
        {total === 0 ? (
          "No results"
        ) : (
          <>
            Showing <span className="font-medium text-neutral-900">{from}-{to}</span> of{" "}
            <span className="font-medium text-neutral-900">{total}</span>
          </>
        )}
      </p>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-neutral-600">
          <select
            value={perPage}
            onChange={(e) => onPerPageChange(Number(e.target.value))}
            className="rounded-lg border border-neutral-200 bg-white py-1.5 pl-2.5 pr-7 text-sm"
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n} per page
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
            className="flex size-8 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <AdminIcon name="chevronLeft" className="size-4" />
          </button>
          <span className="flex size-8 items-center justify-center rounded-full bg-corisio-blue text-sm font-medium text-white">
            {page}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            aria-label="Next page"
            className="flex size-8 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <AdminIcon name="chevronRight" className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
