"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import { ALL_FIELD_KEYS, findFieldSection } from "@/lib/passport-content";
import { PASSPORT_COOKIE } from "@/lib/passport-session";

// No accounts exist yet (see passport-session.ts), so there's no real
// authorisation to check here. This at least stops one browser tab from
// writing into a passport it doesn't hold the cookie for, cheap to do now
// and worth doing even though it's superseded by real auth in a later step.
async function assertOwnsPassport(passportId: string) {
  const cookieStore = await cookies();
  if (cookieStore.get(PASSPORT_COOKIE)?.value !== passportId) {
    throw new Error("Not authorised to modify this passport.");
  }
}

/** Upserts a single answered field, called on blur/change as the user
 * progresses through the flow, not just when they reach the end. */
export async function saveResponse(passportId: string, fieldKey: string, value: string | string[]) {
  await assertOwnsPassport(passportId);
  if (!ALL_FIELD_KEYS.has(fieldKey)) {
    throw new Error(`Unknown passport field: ${fieldKey}`);
  }
  const section = findFieldSection(fieldKey);
  const jsonValue = value as Prisma.InputJsonValue;

  await prisma.passportResponse.upsert({
    where: { passportId_fieldKey: { passportId, fieldKey } },
    create: { passportId, section, fieldKey, value: jsonValue },
    update: { value: jsonValue },
  });
}

/** Upserts one cell of the section x recipient sharing consent matrix. */
export async function saveConsent(passportId: string, section: string, recipient: string, shared: boolean) {
  await assertOwnsPassport(passportId);

  await prisma.passportConsent.upsert({
    where: { passportId_section_recipient: { passportId, section, recipient } },
    create: { passportId, section, recipient, shared },
    update: { shared },
  });
}

/** Upserts several consent cells in one round trip, for the "share
 * everything with X" / "clear all" quick actions. Next.js dispatches
 * Server Actions one at a time per client, so this does the fan-out in a
 * single transaction server-side rather than the caller firing one
 * saveConsent call per cell. */
export async function saveConsentBulk(
  passportId: string,
  updates: { section: string; recipient: string; shared: boolean }[],
) {
  await assertOwnsPassport(passportId);

  await prisma.$transaction(
    updates.map((u) =>
      prisma.passportConsent.upsert({
        where: { passportId_section_recipient: { passportId, section: u.section, recipient: u.recipient } },
        create: { passportId, section: u.section, recipient: u.recipient, shared: u.shared },
        update: { shared: u.shared },
      }),
    ),
  );
}

/** Marks the passport complete. Report generation (PDF/print export,
 * per-recipient reports) is build step 3, out of scope here, this just
 * records that the employee reached the end of the flow. */
export async function completePassport(passportId: string) {
  await assertOwnsPassport(passportId);
  await prisma.passport.update({ where: { id: passportId }, data: { status: "complete" } });
}
