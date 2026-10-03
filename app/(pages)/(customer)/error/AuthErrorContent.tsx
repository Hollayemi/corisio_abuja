"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

enum Error {
  Configuration = "Configuration",
  AccessDenied = "AccessDenied",
  Verification = "Verification",
  Default = "Default",
}

const errorMap: Record<Error, string> = {
  [Error.Configuration]: "There is a problem with the server configuration.",
  [Error.AccessDenied]: "You do not have permission to sign in.",
  [Error.Verification]: "The sign in link is no longer valid. Please request a new one.",
  [Error.Default]: "Unable to sign in. Please try again later.",
};

export default function AuthErrorContent() {
  const search = useSearchParams();
  const error = search.get("error") as Error;

  return (
    <div className="flex h-80 w-full flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="block max-w-sm rounded-lg border border-gray-200 bg-white p-6 text-center shadow hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
        <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
          Authentication Error
        </h5>
        <div className="font-normal text-gray-700 dark:text-gray-400">
          {errorMap[error] || errorMap[Error.Default]}
        </div>
        <Link
          href="/auth/signin"
          className="mt-4 inline-block rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}