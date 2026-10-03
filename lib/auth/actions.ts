"use server";

import { createUser } from "./users";
import { isValidEmail, isValidName, isValidPassword, MIN_PASSWORD_LENGTH } from "./validation";

type Result = { ok: true } | { ok: false; error: string };

export async function registerAction(input: {
  name: string;
  email: string;
  password: string;
}): Promise<Result> {
  const name = String(input?.name ?? "");
  const email = String(input?.email ?? "");
  const password = String(input?.password ?? "");

  if (!isValidName(name)) return { ok: false, error: "Enter your full name." };
  if (!isValidEmail(email)) return { ok: false, error: "Enter a valid email address." };
  if (!isValidPassword(password)) {
    return { ok: false, error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` };
  }

  const result = await createUser({ name, email, password });
  if (!result.ok) {
    return { ok: false, error: "An account with this email already exists." };
  }

  return { ok: true };
}

export async function requestPasswordResetAction(email: string): Promise<Result> {
  const value = String(email ?? "").trim();

  if (!isValidEmail(value)) {
    return { ok: false, error: "Enter a valid email address." };
  }

  console.info(`[auth] password reset requested for ${value}`);
  return { ok: true };
}
