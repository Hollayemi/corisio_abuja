"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { SearchIcon } from "../ui/icons";

/** "What are you looking for?" — sends the visitor to /search?q=... */
export default function HeroSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `/search?q=${encodeURIComponent(term)}` : "/search");
  }

  return (
    <form
      role="search"
      onSubmit={onSubmit}
      className="mt-8 flex w-full max-w-[520px] items-center gap-2 rounded-xl border border-corisio-blue/15 bg-white p-1.5 shadow-sm focus-within:border-corisio-blue"
    >
      <SearchIcon className="ml-3 h-4 w-4 shrink-0 text-neutral-400" />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="What are you looking for?"
        aria-label="What are you looking for?"
        className="h-10 min-w-0 flex-1 bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
      />
      <button
        type="submit"
        className="inline-flex h-10 items-center rounded-lg bg-corisio-blue px-5 text-sm font-medium text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corisio-blue"
      >
        Search
      </button>
    </form>
  );
}
