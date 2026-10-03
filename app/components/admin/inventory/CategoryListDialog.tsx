"use client";

import { useDialog } from "@/app/components/dialog/DialogProvider";
import AdminIcon from "@/app/components/admin/layout/AdminIcon";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/redux/config/errors";
import {
  useDeleteCategoryMutation,
  useListCategoriesQuery,
  useUpdateCategoryMutation,
} from "@/redux/slices/inventoryApi";
import type { Category, CategoryStatus } from "@/redux/types";
import { ConfirmDialog } from "@/app/components/admin/ConfirmDialog";
import { CategoryFormDialog } from "./CategoryFormDialog";
import { ModalButton, ModalHeader } from "./ModalHeader";

/** Re-opens the "Product Categories" list — used as the Back target from the add/edit form. */
export function openCategoryList(openDialog: ReturnType<typeof useDialog>["openDialog"]) {
  openDialog(({ close }) => <CategoryListDialog close={close} />, {
    title: "Product Categories",
    side: "center",
    width: "xl",
  });
}

const STATUS_OPTIONS: { label: string; value: CategoryStatus }[] = [
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
];

function StatusToggle({ category }: { category: Category }) {
  const [updateCategory, { isLoading }] = useUpdateCategoryMutation();

  async function handleChange(status: CategoryStatus) {
    if (status === category.status) return;
    try {
      await updateCategory({ id: category.id, status }).unwrap();
    } catch (err) {
      notify.error("Couldn't update status", { message: getErrorMessage(err) });
    }
  }

  return (
    <div className="relative inline-block">
      <select
        value={category.status}
        disabled={isLoading}
        onChange={(e) => handleChange(e.target.value as CategoryStatus)}
        className={`appearance-none rounded-lg border border-neutral-200 bg-white py-1.5 pl-6 pr-8 text-sm disabled:opacity-60 ${
          category.status === "ACTIVE" ? "text-corisio-blue" : "text-neutral-500"
        }`}
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute left-2.5 top-1/2 size-1.5 -translate-y-1/2 rounded-full ${
          category.status === "ACTIVE" ? "bg-corisio-blue" : "bg-neutral-400"
        }`}
      />
      <AdminIcon
        name="chevronDown"
        className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-neutral-500"
      />
    </div>
  );
}

function CategoryRow({ category }: { category: Category }) {
  const { openDialog } = useDialog();
  const [deleteCategory] = useDeleteCategoryMutation();

  function handleEdit() {
    openDialog(
      () => <CategoryFormDialog category={category} onBack={() => openCategoryList(openDialog)} />,
      { title: "Edit Category", side: "center", width: "xl" },
    );
  }

  function handleDelete() {
    openDialog(
      ({ close }) => (
        <ConfirmDialog
          title="Delete this category?"
          description={`"${category.name}" will be removed. Products already in it will need a new category.`}
          onConfirm={async () => {
            try {
              await deleteCategory(category.id).unwrap();
              notify.success("Category deleted");
            } catch (err) {
              notify.error("Couldn't delete category", { message: getErrorMessage(err) });
              throw err;
            }
          }}
          close={close}
        />
      ),
      { title: "Delete category", side: "center", width: "sm" },
    );
  }

  return (
    <tr className="border-b border-neutral-100 last:border-0">
      <td className="py-4 pr-4 text-sm font-medium text-neutral-900">{category.name}</td>
      <td className="py-4 pr-4 text-sm text-neutral-600">
        {category.productCount > 0 ? `${category.productCount} Products` : "-"}
      </td>
      <td className="py-4 pr-4">
        <StatusToggle category={category} />
      </td>
      <td className="py-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleEdit}
            className="flex h-9 items-center gap-1.5 rounded-lg bg-corisio-blue px-3 text-xs font-medium text-white transition hover:brightness-110"
          >
            <AdminIcon name="edit" className="size-3.5" />
            Edit
          </button>
          <button
            type="button"
            onClick={handleDelete}
            aria-label={`Delete ${category.name}`}
            className="flex size-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 transition hover:bg-red-50 hover:text-red-600"
          >
            <AdminIcon name="trash" className="size-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

/** "Product Categories" list (design image 4), opened from the Inventory page's "Add Category" button. */
export function CategoryListDialog({ close }: { close: () => void }) {
  const { openDialog } = useDialog();
  const { data, isLoading, isError, error, refetch } = useListCategoriesQuery();
  const categories = data?.data.items ?? [];

  console.log(categories)

  function handleAddCategory() {
    openDialog(
      () => <CategoryFormDialog onBack={() => openCategoryList(openDialog)} />,
      { title: "Add Category", side: "center", width: "xl" },
    );
  }

  return (
    <>
      <ModalHeader
        title="Product Categories"
        onClose={close}
        actions={
          <ModalButton onClick={handleAddCategory}>
            <AdminIcon name="plus" className="size-4" />
            Add Category
          </ModalButton>
        }
      />

      <div className="max-h-[calc(90dvh-73px)] overflow-y-auto px-6 py-6 sm:px-8">
        {isLoading ? (
          <TableSkeleton />
        ) : isError ? (
          <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
        ) : categories.length === 0 ? (
          <EmptyState onAddCategory={handleAddCategory} />
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-neutral-100 text-xs uppercase tracking-wide text-neutral-400">
                <th className="pb-3 pr-4 font-normal">Category Name</th>
                <th className="pb-3 pr-4 font-normal">Products</th>
                <th className="pb-3 pr-4 font-normal">Status</th>
                <th className="pb-3 font-normal">Active</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category: any) => (
                <CategoryRow key={category.id} category={category} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-12 animate-pulse rounded-lg bg-neutral-100" />
      ))}
    </div>
  );
}

function EmptyState({ onAddCategory }: { onAddCategory: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
        <AdminIcon name="package" className="size-6" />
      </span>
      <p className="text-sm font-medium text-neutral-900">No categories yet</p>
      <p className="max-w-xs text-sm text-neutral-500">
        Categories help customers browse the Luxol catalog. Add your first one to get started.
      </p>
      <button
        type="button"
        onClick={onAddCategory}
        className="mt-2 rounded-lg bg-corisio-blue px-4 py-2 text-sm font-medium text-white hover:brightness-110"
      >
        Add Category
      </button>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <p className="text-sm text-neutral-600">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
      >
        Try again
      </button>
    </div>
  );
}
