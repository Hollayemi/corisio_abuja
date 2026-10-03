import {
  randomBytes,
  randomUUID,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

/**
 * PLACEHOLDER USER STORE (development only).
 *
 * Users live in server memory, so they disappear when the server restarts
 * and they are not shared between serverless instances. Replace the three
 * exported functions with your database or backend API and nothing else in
 * the auth setup needs to change:
 *
 *   createUser(...)        -> insert the user, hash the password
 *   verifyCredentials(...) -> check email + password, return { id, name, email } or null
 */

type StoredUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
};

export type PublicUser = { id: string; name: string; email: string };

const scrypt = promisify(scryptCallback) as (
  password: string,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

// Kept on globalThis so hot reloads in dev don't wipe it
const globalStore = globalThis as unknown as {
  __luxolUsers?: Map<string, StoredUser>;
};
const users = (globalStore.__luxolUsers ??= new Map<string, StoredUser>());

const normalize = (email: string) => email.trim().toLowerCase();

async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, 64);
  return `${salt.toString("hex")}:${key.toString("hex")}`;
}

async function checkPassword(password: string, stored: string) {
  const [saltHex, keyHex] = stored.split(":");
  if (!saltHex || !keyHex) return false;

  const expected = Buffer.from(keyHex, "hex");
  const actual = await scrypt(password, Buffer.from(saltHex, "hex"), expected.length);

  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

const toPublic = ({ id, name, email }: StoredUser): PublicUser => ({
  id,
  name,
  email,
});

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
}): Promise<{ ok: true; user: PublicUser } | { ok: false; error: "EMAIL_TAKEN" }> {
  const email = normalize(input.email);

  if (users.has(email)) return { ok: false, error: "EMAIL_TAKEN" };

  const user: StoredUser = {
    id: randomUUID(),
    name: input.name.trim(),
    email,
    passwordHash: await hashPassword(input.password),
  };
  users.set(email, user);

  return { ok: true, user: toPublic(user) };
}

export async function verifyCredentials(
  email: string,
  password: string,
): Promise<PublicUser | null> {
  const user = users.get(normalize(email));
  if (!user) return null;

  return (await checkPassword(password, user.passwordHash)) ? toPublic(user) : null;
}
