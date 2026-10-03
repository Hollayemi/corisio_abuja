/** Shared by the auth forms (browser) and the server actions, so both agree. */

export const MIN_PASSWORD_LENGTH = 8;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (email: string) => EMAIL_RE.test(email.trim());

export const isValidName = (name: string) => name.trim().length >= 2;

export const isValidPassword = (password: string) =>
  password.length >= MIN_PASSWORD_LENGTH;
