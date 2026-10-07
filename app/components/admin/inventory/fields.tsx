"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import AdminIcon from "@/app/components/admin/layout/AdminIcon";

export const fieldInputClass =
  "w-full rounded-lg border border-transparent bg-neutral-100 px-4 py-3.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-corisio-blue focus:bg-white focus:outline-none focus:ring-2 focus:ring-corisio-blue/30";

const labelClass = "text-sm font-medium text-neutral-900";
const hintClass = "text-xs text-neutral-500";

/** Label + optional hint, wrapping any field control. */
export function Field({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className={labelClass}>
        {label}
      </label>
      {hint && <p className={`mt-1 ${hintClass}`}>{hint}</p>}
      <div className="mt-2.5">{children}</div>
    </div>
  );
}

type TextFieldProps = {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "number";
  required?: boolean;
  readOnly?: boolean;
  min?: number;
};

export function TextField({
  label,
  hint,
  value,
  onChange,
  type = "text",
  required,
  readOnly,
  ...props
}: TextFieldProps) {
  const id = useId();
  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <input
        id={id}
        type={type}
        value={value}
        readOnly={readOnly}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className={fieldInputClass}
        {...props}
      />
    </Field>
  );
}

export function TextareaField({
  label,
  hint,
  value,
  onChange,
  rows = 4,
  ...props
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
} & Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value" | "onChange" | "id" | "className"
>) {
  const id = useId();
  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <textarea
        id={id}
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className={`${fieldInputClass} resize-none`}
        {...props}
      />
    </Field>
  );
}

export type SelectOption = { label: string; value: string };

export function SelectField({
  label,
  hint,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  ...props
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
} & Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "value" | "onChange" | "id" | "className"
>) {
  const id = useId();
  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${fieldInputClass} appearance-none pr-10`}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <AdminIcon
          name="chevronDown"
          className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-neutral-500"
        />
      </div>
    </Field>
  );
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // bumped to 5MB — 300KB is too tight for multiple
const ACCEPTED_IMAGE_TYPES = "image/svg+xml,image/png,image/jpeg,image/gif,image/webp";

export function ImageUploadField({
  label = "Images",
  hint = "SVG, PNG, JPG, GIF or WebP — up to 5MB each",
  value,
  onChange,
  error,
  onError,
  maxFiles = 10,
}: {
  label?: string;
  hint?: string;
  value: File[];
  onChange: (files: File[]) => void;
  error?: string;
  onError?: (message: string) => void;
  maxFiles?: number;
}) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  // Revoke old previews whenever the value changes
  useEffect(() => {
    // Clean up previous object URLs
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  // Rebuild previews from the current File[] value
  useEffect(() => {
    if (!Array.isArray(value) || value.length === 0) {
      setPreviews([]);
      return;
    }
    const urls = value.map((file) => URL.createObjectURL(file)) || [];
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [value]);

  function handleFiles(incoming: FileList | null) {
    if (!incoming?.length) return;

    const files = Array.from(incoming);
    const accepted: File[] = [];

    for (const file of files) {
      if (file.size > MAX_IMAGE_BYTES) {
        onError?.(`"${file.name}" is too large. Max ${MAX_IMAGE_BYTES / 1024 / 1024}MB per file.`);
        continue;
      }
      accepted.push(file);
    }

    const next = [...value, ...accepted].slice(0, maxFiles);
    if (value.length + accepted.length > maxFiles) {
      onError?.(`You can upload up to ${maxFiles} images.`);
    }

    onChange(next);

    // Reset the input so re-selecting the same file triggers onChange again
    if (inputRef.current) inputRef.current.value = "";
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <Field label={label} htmlFor={id}>
      <div>
        {/* Drop zone / trigger */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full items-center gap-4 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-4 text-left transition hover:border-corisio-blue hover:bg-white"
        >
          <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-corisio-100">
            <AdminIcon name="upload" className="size-5 text-corisio-blue" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-neutral-900">
              {value.length === 0
                ? `Upload ${label.toLowerCase()}`
                : `${value.length} image${value.length > 1 ? "s" : ""} selected`}
            </p>
            <p className={hintClass}>{hint}</p>
          </div>
          <span className="rounded-md bg-corisio-100 px-3 py-1 text-xs font-medium text-corisio-blue">
            Choose
          </span>
        </button>

        {/* Preview grid */}
        {previews.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {previews.map((src, i) => (
              <div
                key={`${value[i]?.name}-${i}`}
                className="group relative aspect-square overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100"
              >
                {/* Local preview — not a remote src */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={value[i]?.name ?? ""} className="size-full object-cover" />

                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  aria-label={`Remove ${value[i]?.name}`}
                  className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100 hover:bg-black/80"
                >
                  <AdminIcon name="close" className="size-3" />
                </button>

                {i === 0 && (
                  <span className="absolute bottom-1.5 left-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                    Cover
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Clear all */}
        {value.length > 1 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="mt-2 text-xs font-medium text-neutral-500 hover:text-neutral-800"
          >
            Clear all
          </button>
        )}
      </div>

      <input
        id={id}
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES}
        multiple
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && (
        <p role="alert" className="mt-2 text-xs text-red-600">
          {error}
        </p>
      )}
    </Field>
  );
}

/** Free-text tags, added with Enter or comma ("Chilled, Dairy, Fast-Moving"). */
export function TagsField({
  label,
  hint,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  hint?: string;
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}) {
  const id = useId();
  const [draft, setDraft] = useState("");

  function commit() {
    const tag = draft.trim();
    if (tag && !value.includes(tag)) onChange([...value, tag]);
    setDraft("");
  }

  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <div className={`${fieldInputClass} flex flex-wrap items-center gap-2 py-2`}>
        <AdminIcon name="search" className="size-4 shrink-0 text-neutral-400" />
        {value.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-md bg-white px-2 py-1 text-xs text-neutral-700"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(value.filter((t) => t !== tag))}
              aria-label={`Remove ${tag}`}
              className="text-neutral-400 hover:text-neutral-700"
            >
              <AdminIcon name="close" className="size-3" />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              commit();
            }
          }}
          onBlur={commit}
          placeholder={value.length === 0 ? placeholder : ""}
          className="min-w-[120px] flex-1 bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
        />
      </div>
    </Field>
  );
}
