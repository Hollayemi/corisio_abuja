/** Shared by the auth forms. Keep in step with the backend DTOs (class-validator). */

export const MIN_PASSWORD_LENGTH = 8;

export const PASSWORD_HINT = `At least ${MIN_PASSWORD_LENGTH} characters, with a letter and a number`;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (email: string) => EMAIL_RE.test(email.trim());

export const isValidName = (name: string) => name.trim().length >= 2;

/** Same rule as the backend's PASSWORD_RULE: 8+ characters, a letter and a number. */
export const isValidPassword = (password: string) =>
  password.length >= MIN_PASSWORD_LENGTH &&
  /[A-Za-z]/.test(password) &&
  /\d/.test(password);

export const isNotEmpty = (value: string) => value.trim().length > 0;

/** Parses a latitude/longitude typed into a text box. NaN when it isn't a number in range. */
export function parseCoordinate(value: string, limit: 90 | 180) {
  const n = Number(value.trim());
  return value.trim() !== "" && Number.isFinite(n) && Math.abs(n) <= limit ? n : NaN;
}
