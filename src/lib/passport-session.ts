import "server-only";
import { prisma } from "@/lib/db";

// No login exists yet, real SSO is Phase 2 build step 7 and even the demo
// stand-in login is a later step (Phase 1 build step 5, for managers/HR to
// view shared passports). An employee filling out their own passport
// shouldn't need an account at all, matching the reference prototype, so
// each browser gets an anonymous draft identified by an httpOnly cookie
// holding the passport's own id. Wiring this to a real employee account
// happens when auth lands.

export const PASSPORT_COOKIE = "passport_id";

const DEMO_ORGANISATION_NAME = "Demo Organisation";

/** Creates the demo organisation, an anonymous employee user, and a draft
 * passport for them. Only ever called from a Route Handler or Server
 * Action, both of which are allowed to set cookies, callers are
 * responsible for setting PASSPORT_COOKIE to the returned id. */
export async function createPassportSession(): Promise<string> {
  const organisation =
    (await prisma.organisation.findFirst()) ??
    (await prisma.organisation.create({ data: { name: DEMO_ORGANISATION_NAME } }));

  const user = await prisma.user.create({
    data: {
      organisationId: organisation.id,
      // Placeholder identity for an anonymous demo visitor, real accounts
      // arrive with SSO (Phase 2) or the demo stand-in login (Phase 1 step 5).
      email: `employee-${crypto.randomUUID()}@demo.local`,
      role: "employee",
    },
  });

  const passport = await prisma.passport.create({
    data: { userId: user.id, organisationId: organisation.id, status: "draft" },
  });

  return passport.id;
}

/** Loads a passport by id along with its saved answers and sharing
 * consent, or null if the id doesn't exist (e.g. a stale cookie left over
 * from a reset database). */
export async function loadPassport(passportId: string) {
  return prisma.passport.findUnique({
    where: { id: passportId },
    include: { responses: true, consent: true },
  });
}
