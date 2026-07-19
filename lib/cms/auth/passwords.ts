// lib/cms/auth/passwords.ts
// Per-site client passwords using Node's built-in scrypt (no native deps).
// Stored as "scrypt$<saltHex>$<hashHex>".

import { scrypt as _scrypt, randomBytes, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(_scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number
) => Promise<Buffer>;

const KEYLEN = 32;

export async function hashPassword(plain: string): Promise<string> {
  if (typeof plain !== "string" || plain.length === 0) {
    throw new Error("Password must be a non-empty string");
  }
  const salt = randomBytes(16);
  const derived = await scrypt(plain, salt, KEYLEN);
  return `scrypt$${salt.toString("hex")}$${Buffer.from(derived).toString("hex")}`;
}

export async function verifyPassword(plain: string, stored?: string | null): Promise<boolean> {
  if (!stored || typeof stored !== "string") return false;
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const salt = Buffer.from(parts[1], "hex");
  const expected = Buffer.from(parts[2], "hex");
  const derived = Buffer.from(await scrypt(plain, salt, KEYLEN));
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}
