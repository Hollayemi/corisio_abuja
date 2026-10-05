"use client";

import { useEffect, useRef } from "react";

/**
 * "Continue with Google" using Google Identity Services. Google hands the page
 * an ID token (a JWT); we pass it to the backend as GoogleDto.idToken, and the
 * backend verifies it and returns its own access token.
 *
 * Needs NEXT_PUBLIC_GOOGLE_CLIENT_ID (the same OAuth client id the backend
 * checks the token's audience against).
 */

type GoogleCredentialResponse = { credential?: string };

type GoogleIdApi = {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }) => void;
  renderButton: (
    element: HTMLElement,
    options: {
      type?: "standard";
      theme?: "outline" | "filled_blue" | "filled_black";
      size?: "large" | "medium" | "small";
      text?: "signin_with" | "signup_with" | "continue_with" | "signin";
      shape?: "rectangular" | "pill";
      width?: number;
      logo_alignment?: "left" | "center";
    },
  ) => void;
};

declare global {
  interface Window {
    google?: { accounts: { id: GoogleIdApi } };
  }
}

const SCRIPT_SRC = "https://accounts.google.com/gsi/client";
let scriptPromise: Promise<void> | null = null;

function loadGoogleScript() {
  if (window.google?.accounts?.id) return Promise.resolve();

  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null; // allow a retry next time
      reject(new Error("Google script failed to load"));
    };
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export default function GoogleSignIn({
  onCredential,
  onError,
  disabled = false,
  text = "continue_with",
}: {
  /** Called with Google's ID token once the person picks an account. */
  onCredential: (idToken: string) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
  text?: "signin_with" | "signup_with" | "continue_with";
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // Always call the latest handlers without re-rendering Google's button
  const handlers = useRef({ onCredential, onError });
  useEffect(() => {
    handlers.current = { onCredential, onError };
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !clientId) return;

    let cancelled = false;

    loadGoogleScript()
      .then(() => {
        const google = window.google?.accounts?.id;
        if (cancelled || !google) return;

        google.initialize({
          client_id: clientId,
          callback: (response) => {
            if (response.credential) handlers.current.onCredential(response.credential);
            else handlers.current.onError?.("We couldn't sign you in with Google. Please try again.");
          },
        });

        container.innerHTML = "";
        google.renderButton(container, {
          type: "standard",
          theme: "outline",
          size: "large",
          text,
          shape: "rectangular",
          logo_alignment: "center",
          // Google only accepts a pixel width (max 400)
          width: Math.min(400, Math.max(200, container.clientWidth)),
        });
      })
      .catch(() => {
        if (!cancelled) {
          handlers.current.onError?.("We couldn't reach Google. Please try again.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [clientId, text]);

  if (!clientId) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[auth] NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set; the Google button is hidden.");
    }
    return null;
  }

  return (
    <div
      ref={containerRef}
      aria-label="Continue with Google"
      className={`flex min-h-10 w-full justify-center ${
        disabled ? "pointer-events-none opacity-60" : ""
      }`}
    />
  );
}
