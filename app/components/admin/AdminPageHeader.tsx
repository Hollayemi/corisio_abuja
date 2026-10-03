import type { ReactNode } from "react";

/** Title block at the top of every admin page ("Business Overview" in the design). */
export default function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  /** Buttons on the right, e.g. "Add product" */
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-neutral-500">{description}</p>
        )}
      </div>
      {actions}
    </div>
  );
}
