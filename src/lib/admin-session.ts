import "server-only";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import type { AdminRecipient } from "@/lib/admin-data";

// Demo stand-in login for the manager/HR admin view (Phase 1 build step 5).
// This is NOT the real SSO integration, that's Phase 2 build step 7 against
// the client's own Azure AD / Google Workspace / generic SAML. Only ever
// populate this with fake/sample accounts, matching CLAUDE.md, never real
// employee data, while this stand-in is in place.

export const ADMIN_SESSION_COOKIE = "admin_session";
const SESSION_LIFETIME_MS = 1000 * 60 * 60 * 12; // 12 hours

const DEMO_ORGANISATION_NAME = "Demo Organisation";

// Fixed, documented demo credentials, shown on the login page itself, same
// spirit as the rest of the app's "Demo stand-in" notices, nothing hidden.
const DEMO_ACCOUNTS = [
  { email: "manager@demo.local", password: "manager-demo", role: "manager" },
  { email: "hr@demo.local", password: "hr-demo", role: "hr_admin" },
] as const;

/** Creates the demo organisation and the demo manager/HR accounts if they
 * don't already exist. Called from the login page so a fresh clone works
 * immediately without a separate seed command to remember to run, same
 * lazy-bootstrap approach passport-session.ts uses for the demo org. */
export async function ensureDemoAdminAccounts(): Promise<void> {
  const organisation =
    (await prisma.organisation.findFirst()) ??
    (await prisma.organisation.create({ data: { name: DEMO_ORGANISATION_NAME } }));

  for (const account of DEMO_ACCOUNTS) {
    const existing = await prisma.user.findUnique({
      where: { organisationId_email: { organisationId: organisation.id, email: account.email } },
    });
    if (existing) continue;

    await prisma.user.create({
      data: {
        organisationId: organisation.id,
        email: account.email,
        role: account.role,
        passwordHash: hashPassword(account.password),
      },
    });
  }
}

export const DEMO_LOGIN_HINTS = DEMO_ACCOUNTS.map((a) => ({ email: a.email, password: a.password }));

/** role -> the admin recipient view that role sees. Only manager/hr_admin
 * can sign in at all, employee accounts have no passwordHash and never
 * reach here. Occupational Health has no role at all, see CLAUDE.md, it's
 * an external report recipient only. */
export function recipientForRole(role: string): AdminRecipient | null {
  if (role === "manager") return "manager";
  if (role === "hr_admin") return "hr";
  return null;
}

export interface AdminSessionUser {
  id: string;
  email: string;
  role: string;
  organisationId: string;
}

/** Verifies credentials and creates a new session row plus its cookie, or
 * returns null if the email/password don't match. Deliberately returns the
 * same null for "no such account" and "wrong password" so a failed login
 * can't be used to check which emails have accounts. */
export async function signInWithPassword(email: string, password: string): Promise<AdminSessionUser | null> {
  const user = await prisma.user.findFirst({ where: { email, passwordHash: { not: null } } });
  if (!user || !user.passwordHash || !verifyPassword(password, user.passwordHash)) return null;

  const expiresAt = new Date(Date.now() + SESSION_LIFETIME_MS);
  const session = await prisma.adminSession.create({ data: { userId: user.id, expiresAt } });

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, session.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });

  return { id: user.id, email: user.email, role: user.role, organisationId: user.organisationId };
}

/** Reads the session cookie, looks up the row, and returns the signed-in
 * user, or null if there's no cookie, the row doesn't exist, or it's
 * expired (an expired row is deleted here rather than left to rot). */
export async function getAdminSessionUser(): Promise<AdminSessionUser | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  const session = await prisma.adminSession.findUnique({ where: { id: sessionId }, include: { user: true } });
  if (!session) return null;

  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.adminSession.delete({ where: { id: session.id } });
    return null;
  }

  const { user } = session;
  return { id: user.id, email: user.email, role: user.role, organisationId: user.organisationId };
}

/** Deletes the session row and its cookie, for logout. */
export async function destroyAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (sessionId) await prisma.adminSession.deleteMany({ where: { id: sessionId } });
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}
