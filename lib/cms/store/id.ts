// lib/cms/store/id.ts
// Small URL-safe id generator (no external dependency). Good enough for
// site/page/snapshot ids.

import { randomBytes } from "node:crypto";

const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function nanoid(size = 8): string {
  const bytes = randomBytes(size);
  let out = "";
  for (let i = 0; i < size; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
}
