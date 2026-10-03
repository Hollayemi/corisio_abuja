"use client";

import { useEffect, useRef, useState } from "react";
import { EditIcon } from "@/app/components/ui/icons";

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

export default function Avatar({
  name,
  src,
  uploading = false,
  onPick,
}: {
  name: string;
  /** The saved avatar URL from the server, or "" for the initials fallback. */
  src: string;
  uploading?: boolean;
  onPick: (file: File) => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Cleanup only (no setState here) — release the object URL once it's
  // replaced or the component unmounts.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handlePick() {
    fileInput.current?.click();
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    onPick(file);
  }

  // Trust the local preview only while an upload is actually in flight;
  // once it settles (success or error) we fall back to the real `src` —
  // no effect needed to "clear" it.
  const shown = uploading && previewUrl ? previewUrl : src;

  return (
    <div className="relative mx-auto size-[160px]">
      <span className="flex size-full items-center justify-center overflow-hidden rounded-full bg-corisio-blue/10">
        {shown ? (
          // A freshly-picked photo is a local object: URL preview until the
          // upload resolves — next/image can't optimize those, so a plain
          // <img> is the right tool for this one spot.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={shown}
            alt={`${name}'s photo`}
            width={160}
            height={160}
            className={`size-full object-cover transition-opacity ${uploading ? "opacity-60" : ""}`}
          />
        ) : (
          <span className="text-3xl font-bold text-corisio-blue">{initialsOf(name)}</span>
        )}
      </span>

      <button
        type="button"
        onClick={handlePick}
        disabled={uploading}
        aria-label="Change profile photo"
        className="absolute bottom-1 right-1 flex size-9 items-center justify-center rounded-full border-2 border-white bg-corisio-blue text-white shadow-sm transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corisio-blue disabled:opacity-70"
      >
        <EditIcon className="size-4" />
      </button>

      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
}
