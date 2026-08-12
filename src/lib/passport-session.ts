import "server-only";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import type { RecipientKey } from "@/lib/passport-content";

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

/** Loads the passport belonging to whichever cookie the current request
 * carries, or null if there isn't one (no cookie yet, or a stale id).
 * Shared by every page that needs "my own passport": the wizard and the
 * report views. Doesn't redirect itself, since the wizard and the report
 * pages want slightly different fallback behaviour. */
export async function loadOwnPassport() {
  const cookieStore = await cookies();
  const passportId = cookieStore.get(PASSPORT_COOKIE)?.value;
  return passportId ? loadPassport(passportId) : null;
}

export type Answers = Record<string, string | string[]>;
export type ConsentMap = Record<string, Partial<Record<RecipientKey, boolean>>>;

/** Reshapes a loaded passport's flat responses/consent rows (one row per
 * field, one row per section x recipient) into the key-value maps the
 * wizard and report builders actually work with. */
export function toAnswersAndConsent(passport: NonNullable<Awaited<ReturnType<typeof loadPassport>>>): {
  answers: Answers;
  consent: ConsentMap;
} {
  const answers: Answers = {};
  for (const response of passport.responses) {
    answers[response.fieldKey] = response.value as unknown as string | string[];
  }

  const consent: ConsentMap = {};
  for (const entry of passport.consent) {
    const recipient = entry.recipient as RecipientKey;
    consent[entry.section] = { ...consent[entry.section], [recipient]: entry.shared };
  }

  return { answers, consent };
}
