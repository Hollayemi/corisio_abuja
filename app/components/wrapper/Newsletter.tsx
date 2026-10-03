"use client";

import { useId, useState, type FormEvent } from "react";

/**
 * Called with the email when the form is submitted. Pass a Next.js Server
 * Action here. Return { ok: false, message } to show an error.
 */
export type NewsletterAction = (
  email: string,
) => Promise<{ ok: boolean; message?: string } | void>;

type Status = {
  state: "idle" | "loading" | "success" | "error";
  message?: string;
};

const FALLBACK_ERROR = "We couldn't subscribe you. Please try again.";

export default function Newsletter({ action }: { action?: NewsletterAction }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const inputId = useId();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = email.trim();
    if (!value) return;

    setStatus({ state: "loading" });

    try {
      const result = action ? await action(value) : undefined;

      if (result && !result.ok) {
        setStatus({ state: "error", message: result.message ?? FALLBACK_ERROR });
        return;
      }

      setEmail("");
      setStatus({
        state: "success",
        message: result?.message ?? "Thanks for subscribing!",
      });
    } catch {
      setStatus({ state: "error", message: FALLBACK_ERROR });
    }
  }

  const loading = status.state === "loading";

  return (
    <section
      aria-labelledby="newsletter-heading"
      className="mx-auto w-full max-w-[1240px] px-4 py-12 text-center sm:px-6 sm:py-16"
    >
      <p className="text-sm font-medium text-neutral-700">Our Newsletter</p>

      <h2
        id="newsletter-heading"
        className="mt-3 text-2xl font-bold leading-tight text-neutral-900 sm:text-3xl"
      >
        Subscribe to our Newsletter to get
        <span className="block text-corisio-yellow">
          Updates on Our Latest Offers
        </span>
      </h2>

      <form
        onSubmit={handleSubmit}
        className="mx-auto mt-8 flex max-w-[560px] flex-col gap-3 sm:flex-row"
      >
        <label htmlFor={inputId} className="sr-only">
          Email address
        </label>
        <input
          id={inputId}
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email address"
          className="h-12 min-w-0 flex-1 rounded-lg border border-neutral-200 bg-white px-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-corisio-yellow focus:outline-none focus:ring-2 focus:ring-corisio-yellow/40"
        />
        <button
          type="submit"
          disabled={loading}
          className="h-12 rounded-lg bg-corisio-yellow px-7 text-sm font-semibold text-black transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corisio-yellow disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Subscribing..." : "Subscribe"}
        </button>
      </form>

      <p
        role="status"
        className={`mt-3 min-h-5 text-sm ${
          status.state === "error" ? "text-red-600" : "text-corisio-blue"
        }`}
      >
        {status.message}
      </p>
    </section>
  );
}
