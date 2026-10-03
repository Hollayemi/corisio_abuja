import { Suspense } from "react";
import AuthErrorContent from "./AuthErrorContent";

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-80 w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-gray-700 dark:text-gray-400">Loading…</div>
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}