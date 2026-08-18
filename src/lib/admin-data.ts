import "server-only";
import { prisma } from "@/lib/db";
import { CONSENT_SECTIONS, SECTIONS } from "@/lib/passport-content";
import { toAnswersAndConsent, type Answers, type ConsentMap } from "@/lib/passport-session";
import { valText } from "@/lib/report-content";

// Manager/HR admin view (Phase 1 build step 4). Occupational Health is
// deliberately excluded from every export in this file: per CLAUDE.md it's
// an external report recipient only, with no login role and no dashboard
// access of any kind, not even a read-only one.
export const ADMIN_RECIPIENTS = ["manager", "hr"] as const;
export type AdminRecipient = (typeof ADMIN_RECIPIENTS)[number];

export function isAdminRecipient(value: string): value is AdminRecipient {
  return (ADMIN_RECIPIENTS as readonly string[]).includes(value);
}

const ADMIN_RECIPIENT_LABELS: Record<AdminRecipient, string> = {
  manager: "Manager",
  hr: "HR",
};

export function adminRecipientLabel(recipient: AdminRecipient): string {
  return ADMIN_RECIPIENT_LABELS[recipient];
}

export interface SharedPassportSummary {
  id: string;
  name: string;
  role: string;
  status: string;
  lastUpdatedAt: Date;
  sharedSections: { key: string; icon: string; label: string }[];
}

/** Passports with at least one section shared with `recipient`, most
 * recently updated first, scoped to the signed-in manager/HR user's own
 * organisation. Consent is checked per-section here, same rule as every
 * other read in the app, a passport only appears because specific sections
 * were shared, not because it exists. */
export async function listSharedPassports(
  recipient: AdminRecipient,
  organisationId: string,
): Promise<SharedPassportSummary[]> {
  const passports = await prisma.passport.findMany({
    where: { organisationId, consent: { some: { recipient, shared: true } } },
    include: { responses: true, consent: true },
    orderBy: { lastUpdatedAt: "desc" },
  });

  return passports.map((passport) => {
    const { answers, consent } = toAnswersAndConsent(passport);
    const sharedSections = CONSENT_SECTIONS.filter((s) => consent[s.key]?.[recipient]);
    return {
      id: passport.id,
      name: valText(answers, "f-name") || "Unnamed employee",
      role: valText(answers, "f-role"),
      status: passport.status,
      lastUpdatedAt: passport.lastUpdatedAt,
      sharedSections,
    };
  });
}

export interface SharedPassportRecord {
  answers: Answers;
  consent: ConsentMap;
  name: string;
}

/** Loads one passport for admin viewing, no ownership cookie check, this is
 * a read on someone else's passport by design, unlike passport-actions.ts's
 * assertOwnsPassport. Access control here has two independent gates: the
 * passport must belong to the caller's own organisation (the non-negotiable
 * boundary in CLAUDE.md, checked even though today's demo only ever has one
 * organisation), and it must have actually shared something with
 * `recipient`. Returns null if either fails, or the passport doesn't exist,
 * so a guessed id can't be used to browse passports that were never shared
 * or that belong to someone else's organisation. */
export async function loadSharedPassport(
  passportId: string,
  recipient: AdminRecipient,
  organisationId: string,
): Promise<SharedPassportRecord | null> {
  const passport = await prisma.passport.findUnique({
    where: { id: passportId },
    include: { responses: true, consent: true },
  });
  if (!passport || passport.organisationId !== organisationId) return null;

  const { answers, consent } = toAnswersAndConsent(passport);
  const hasAnyShare = CONSENT_SECTIONS.some((s) => consent[s.key]?.[recipient]);
  if (!hasAnyShare) return null;

  return { answers, consent, name: valText(answers, "f-name") || "Unnamed employee" };
}

export interface AggregateOption {
  value: string;
  label: string;
  count: number;
}
export interface AggregateField {
  fieldKey: string;
  label: string;
  respondents: number;
  options: AggregateOption[];
}
export interface AggregateSection {
  key: string;
  icon: string;
  label: string;
  fields: AggregateField[];
}

/** Counts of checkbox-group answers across every passport that has shared
 * the containing section with `recipient`, themes only, e.g. "6 people
 * selected X". Free-text fields never feed this, per CLAUDE.md's aggregate
 * reporting rule, only checkbox fields do. A field only counts respondents
 * who both answered it and shared the section it lives in, matching the
 * per-section consent check every other read in the app makes. */
export async function buildAggregateThemes(
  recipient: AdminRecipient,
  organisationId: string,
): Promise<AggregateSection[]> {
  const passports = await prisma.passport.findMany({
    where: { organisationId, consent: { some: { recipient, shared: true } } },
    include: { responses: true, consent: true },
  });
  const records = passports.map(toAnswersAndConsent);

  const results: AggregateSection[] = [];

  for (const section of SECTIONS) {
    // "About You" carries no checkbox fields and isn't itself a consent
    // section, see CONSENT_SECTIONS, so there's nothing to aggregate here.
    if (section.key === "about") continue;

    const checkboxFields = section.fields.filter((f) => f.type === "checkbox-group");
    if (checkboxFields.length === 0) continue;

    const sharedWith = records.filter((r) => r.consent[section.key]?.[recipient]);
    if (sharedWith.length === 0) continue;

    const fieldResults: AggregateField[] = [];
    for (const field of checkboxFields) {
      const counts = new Map<string, number>();
      let respondents = 0;

      for (const { answers } of sharedWith) {
        const selected = answers[field.key];
        const values = Array.isArray(selected) ? selected : [];
        if (values.length === 0) continue;
        respondents += 1;
        for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
      }
      if (respondents === 0) continue;

      const options = (field.options ?? [])
        .map((o) => ({ value: o.value, label: o.label, count: counts.get(o.value) ?? 0 }))
        .filter((o) => o.count > 0)
        .sort((a, b) => b.count - a.count);
      if (options.length > 0) {
        fieldResults.push({ fieldKey: field.key, label: field.label, respondents, options });
      }
    }

    if (fieldResults.length > 0) {
      results.push({ key: section.key, icon: section.icon, label: section.title, fields: fieldResults });
    }
  }

  return results;
}
