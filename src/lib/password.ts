import "server-only";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

// Salted scrypt via Node's built-in crypto module rather than a bcrypt/argon2
// dependency, deliberately: this only ever guards the Phase 1 demo login
// (manager/HR admin accounts, see CLAUDE.md build step 5), so there's no
// reason to add a package for it. Still real hashing, not plaintext, scrypt
// is a solid choice for that. scryptSync blocks the event loop briefly, fine
// at demo traffic levels, revisit if this carries into Phase 2 real auth.

const KEY_LENGTH = 64;

/** Returns "saltHex:hashHex", store the whole string as User.passwordHash. */
export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, KEY_LENGTH);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

/** Constant-time compare so a failed login can't be timed to learn how much
 * of the password matched. */
export function verifyPassword(password: string, stored: string): boolean {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;

  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(password, salt, expected.length);

  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
