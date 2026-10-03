import Link from "next/link";
import { ChevronDownIcon } from "./icons";

type PaginationProps = {
  page: number;
  totalPages: number;
  /** Build the URL for a given page number. */
  hrefForPage: (page: number) => string;
  className?: string;
};

function pageItems(current: number, total: number): (number | "…")[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

  const items: (number | "…")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) items.push("…");
  for (let i = start; i <= end; i++) items.push(i);
  if (end < total - 1) items.push("…");
  items.push(total);

  return items;
}

export default function Pagination({
  page,
  totalPages,
  hrefForPage,
  className = "",
}: PaginationProps) {
  return (
    <nav
      aria-label="Pagination"
      className={`flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm sm:gap-x-10 ${className}`}
    >
      {page > 1 ? (
        <Link
          href={hrefForPage(page - 1)}
          rel="prev"
          className="inline-flex items-center gap-2 text-neutral-900 hover:text-corisio-blue"
        >
          <ChevronDownIcon className="size-4 rotate-90" />
          Previous
        </Link>
      ) : (
        <span
          aria-disabled="true"
          className="inline-flex items-center gap-2 text-neutral-400"
        >
          <ChevronDownIcon className="size-4 rotate-90" />
          Previous
        </span>
      )}

      <ul className="flex items-center gap-4">
        {pageItems(page, totalPages).map((entry, i) =>
          entry === "…" ? (
            <li key={`gap-${i}`} aria-hidden="true" className="text-neutral-500">
              …
            </li>
          ) : (
            <li key={entry}>
              <Link
                href={hrefForPage(entry)}
                aria-label={`Page ${entry}`}
                aria-current={entry === page ? "page" : undefined}
                className={
                  entry === page
                    ? "font-medium text-corisio-yellow underline underline-offset-8"
                    : "text-neutral-900 hover:text-corisio-blue"
                }
              >
                {entry}
              </Link>
            </li>
          ),
        )}
      </ul>

      {page < totalPages ? (
        <Link
          href={hrefForPage(page + 1)}
          rel="next"
          className="inline-flex items-center gap-2 font-medium text-neutral-900 hover:text-corisio-blue"
        >
          Next
          <ChevronDownIcon className="size-4 -rotate-90" />
        </Link>
      ) : (
        <span
          aria-disabled="true"
          className="inline-flex items-center gap-2 font-medium text-neutral-400"
        >
          Next
          <ChevronDownIcon className="size-4 -rotate-90" />
        </span>
      )}
    </nav>
  );
}
