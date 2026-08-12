// Builds the structured data behind all three reports (employee copy,
// manager conversation guide, HR summary) from a passport's saved answers
// and consent choices. Deliberately returns plain data, not HTML strings or
// JSX, matching reference-prototype.html's logic (row/section/buildEeesEntries
// etc.) but split from rendering so the same builder feeds both the on-screen
// report and the plain-text mailto fallback.

import {
  CONSENT_SECTIONS,
  SHARE_METHOD_FIELD_KEY,
  SHARE_METHOD_OTHER_FIELD_KEY,
  type RecipientKey,
} from "@/lib/passport-content";
import {
  ACTION_FLAGS,
  EEES_META,
  QUOTE_PROMPTS,
  REPORT_SECTION_FIELDS,
  TEXT_FIELD_TAGS,
  TRANSLATIONS,
  type EeesTag,
} from "@/lib/eees-content";

export type Answers = Record<string, string | string[] | undefined>;
export type ConsentMap = Record<string, Partial<Record<RecipientKey, boolean>>>;

export function getChecked(answers: Answers, key: string): string[] {
  const v = answers[key];
  return Array.isArray(v) ? v : [];
}

export function getRadio(answers: Answers, key: string): string {
  const v = answers[key];
  return typeof v === "string" ? v : "";
}

export function valText(answers: Answers, key: string): string {
  const v = answers[key];
  return typeof v === "string" ? v.trim() : "";
}

export function isShared(consent: ConsentMap, sectionKey: string, recipient: RecipientKey): boolean {
  return Boolean(consent[sectionKey]?.[recipient]);
}

const RECIPIENT_LABELS: Record<RecipientKey, string> = {
  manager: "Manager",
  hr: "HR",
  occupational_health: "Occupational Health",
};

/** Which recipients (by label) a given section has been shared with, in a
 * fixed order, for the "Your Sharing Choices" / "Sharing Overview" tables. */
export function recipientsForSection(consent: ConsentMap, sectionKey: string): string[] {
  return (["manager", "hr", "occupational_health"] as RecipientKey[])
    .filter((r) => isShared(consent, sectionKey, r))
    .map((r) => RECIPIENT_LABELS[r]);
}

export interface ReportedEeesEntry {
  kind: "reported";
  reported: string;
  meaning: string;
  questions: string[];
  adjustments: string[];
  sectionLabel: string;
}
export interface QuoteEeesEntry {
  kind: "quote";
  quote: string;
  sectionLabel: string;
}
export type EeesEntry = ReportedEeesEntry | QuoteEeesEntry;
export type EeesGroups = Record<EeesTag, EeesEntry[]>;

/** Everything a given recipient has been shared, translated via the EEES
 * dictionary into plain-language meaning + questions + adjustments (for
 * directly-reported checkbox values), or left as a verbatim quote with
 * generic exploratory prompts (for free-text fields, which can't be looked
 * up by value). "None currently" style options are absent from
 * TRANSLATIONS on purpose, so they're silently skipped here too. */
export function buildEeesEntries(answers: Answers, consent: ConsentMap, recipient: RecipientKey): EeesGroups {
  const groups: EeesGroups = { ef: [], er: [], env: [], sen: [] };

  for (const section of CONSENT_SECTIONS) {
    if (!isShared(consent, section.key, recipient)) continue;
    const fields = REPORT_SECTION_FIELDS[section.key];
    if (!fields) continue;

    for (const fieldKey of fields.checkFields) {
      for (const value of getChecked(answers, fieldKey)) {
        const t = TRANSLATIONS[fieldKey]?.[value];
        if (!t) continue;
        for (const tag of t.tags) {
          groups[tag].push({
            kind: "reported",
            reported: value,
            meaning: t.meaning,
            questions: t.questions ?? [],
            adjustments: t.adjustments ?? [],
            sectionLabel: section.label,
          });
        }
      }
    }

    for (const fieldKey of fields.textFields) {
      const text = valText(answers, fieldKey);
      if (!text) continue;
      const tags = TEXT_FIELD_TAGS[fieldKey] ?? ["ef"];
      for (const tag of tags) {
        groups[tag].push({ kind: "quote", quote: text, sectionLabel: section.label });
      }
    }
  }

  return groups;
}

export function hasAnyEeesContent(groups: EeesGroups): boolean {
  return EEES_META.some((meta) => groups[meta.key].length > 0);
}

/** Follow-up actions worth flagging for HR specifically (funding
 * applications, referrals, standing arrangements), deduplicated. */
export function buildActionFlags(answers: Answers, consent: ConsentMap, recipient: RecipientKey): string[] {
  const flags: string[] = [];
  for (const section of CONSENT_SECTIONS) {
    if (!isShared(consent, section.key, recipient)) continue;
    const fields = REPORT_SECTION_FIELDS[section.key];
    if (!fields) continue;
    for (const fieldKey of fields.checkFields) {
      for (const value of getChecked(answers, fieldKey)) {
        const flag = ACTION_FLAGS[fieldKey]?.[value];
        if (flag && !flags.includes(flag)) flags.push(flag);
      }
    }
  }
  return flags;
}

/** Sections not shared with a given recipient, excluding "priorities"
 * (matching the manager report's "not shared with you" note, which the
 * prototype excludes priorities from since it's summarised separately). */
export function sectionsNotSharedWith(consent: ConsentMap, recipient: RecipientKey, excludePriorities = true) {
  return CONSENT_SECTIONS.filter((s) => (!excludePriorities || s.key !== "priorities") && !isShared(consent, s.key, recipient));
}

export const QUOTE_PROMPTS_FOR = (tag: EeesTag) => QUOTE_PROMPTS[tag];

export function reportDateString(): string {
  return new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export function employeeHeaderLines(answers: Answers): string[] {
  const dateLine = `Generated ${reportDateString()}`;
  const parts = [valText(answers, "f-name"), valText(answers, "f-role"), valText(answers, "f-org")].filter(Boolean);
  return parts.length ? [dateLine, parts.join(" • ")] : [dateLine];
}

export function managerHeaderLines(answers: Answers): string[] {
  const dateLine = `Prepared ${reportDateString()}`;
  const name = valText(answers, "f-name");
  const role = valText(answers, "f-role");
  return name ? [dateLine, `For discussing support with ${name}${role ? ` (${role})` : ""}`] : [dateLine];
}

export function hrHeaderLines(answers: Answers): string[] {
  const dateLine = `Prepared ${reportDateString()}`;
  const name = valText(answers, "f-name");
  const role = valText(answers, "f-role");
  return name ? [dateLine, `${name}${role ? ` (${role})` : ""}`] : [dateLine];
}

export interface ReportRow {
  label: string;
  value: string | string[] | undefined;
}
export interface ReportSectionData {
  icon: string;
  title: string;
  rows: ReportRow[];
}

/** The employee's own copy is always the full record, every section,
 * regardless of sharing choices, plus a summary of those choices. Returned
 * as data (not JSX or HTML) so the on-screen report and the plain-text
 * mailto fallback below can both consume it without duplicating this list. */
export function buildEmployeeSections(answers: Answers, consent: ConsentMap): ReportSectionData[] {
  const contactName = valText(answers, "f-contact-name");
  const contactDetail = valText(answers, "f-contact-detail");
  const methodVal = getRadio(answers, SHARE_METHOD_FIELD_KEY);
  const methodDisplay =
    methodVal === "Other" ? valText(answers, SHARE_METHOD_OTHER_FIELD_KEY) || "Other (not specified)" : methodVal;
  const variesVal = getRadio(answers, "varies");

  const sharingRows: ReportRow[] = CONSENT_SECTIONS.map((s) => ({
    label: `${s.icon} ${s.label}`,
    value: recipientsForSection(consent, s.key).join(", ") || "Not shared",
  }));
  if (methodDisplay) sharingRows.push({ label: "How you'd like it shared", value: methodDisplay });

  const wellbeingRows: ReportRow[] = [
    { label: "Factors that affect work experience", value: getChecked(answers, "wellbeing") },
    { label: "In-work support that would help", value: getChecked(answers, "in-work-support") },
    { label: "Does situation vary?", value: variesVal },
  ];
  if (variesVal === "Yes" || variesVal === "Somewhat") {
    wellbeingRows.push({ label: "How it varies", value: valText(answers, "varies-detail") });
  }
  wellbeingRows.push({ label: "Additional notes", value: valText(answers, "wellbeing-other") });

  return [
    {
      icon: "👤",
      title: "About You",
      rows: [
        { label: "Name", value: valText(answers, "f-name") },
        { label: "Role", value: valText(answers, "f-role") },
        { label: "Organisation", value: valText(answers, "f-org") },
        {
          label: "Named contact",
          value: contactName ? `${contactName}${contactDetail ? ` • ${contactDetail}` : ""}` : "",
        },
      ],
    },
    { icon: "🔒", title: "Your Sharing Choices", rows: sharingRows },
    {
      icon: "🏢",
      title: "Working Environment",
      rows: [
        { label: "Works best in", value: getChecked(answers, "work-location") },
        { label: "Environmental and sensory factors", value: getChecked(answers, "env-sensory") },
        { label: "Additional notes", value: valText(answers, "env-other") },
      ],
    },
    {
      icon: "💻",
      title: "Equipment and Technology",
      rows: [
        { label: "Useful or needed equipment", value: getChecked(answers, "equipment") },
        { label: "Assistive technology or software", value: getChecked(answers, "software") },
        { label: "Information about software wanted", value: getRadio(answers, "software-info") },
        { label: "Additional notes", value: valText(answers, "equipment-other") },
      ],
    },
    {
      icon: "🚌",
      title: "Getting To and From Work",
      rows: [
        { label: "Travel support needed", value: getChecked(answers, "travel") },
        { label: "Building access needed", value: getChecked(answers, "access") },
        { label: "Additional notes", value: valText(answers, "travel-other") },
      ],
    },
    {
      icon: "💬",
      title: "Communication and Interaction",
      rows: [
        { label: "Preferred way to receive information", value: getChecked(answers, "info-receive") },
        { label: "Communication style", value: getChecked(answers, "comm-style") },
        { label: "Interview or assessment adjustments", value: getChecked(answers, "interview") },
        { label: "Additional notes", value: valText(answers, "comm-other") },
      ],
    },
    {
      icon: "📋",
      title: "Planning, Organisation and Workload",
      rows: [
        { label: "What helps manage workload", value: getChecked(answers, "workload") },
        { label: "Areas that are particularly difficult", value: getChecked(answers, "exec-difficulty") },
        { label: "Additional notes", value: valText(answers, "workload-other") },
      ],
    },
    { icon: "🌱", title: "Wellbeing and In-Work Support", rows: wellbeingRows },
    {
      icon: "✅",
      title: "Priorities and Next Steps",
      rows: [
        { label: "Top three priorities", value: valText(answers, "top-three") },
        { label: "Previous support that helped", value: valText(answers, "prev-support") },
        { label: "Already shared with", value: getChecked(answers, "shared-with") },
        { label: "Intended use of this passport", value: getChecked(answers, "passport-use") },
        { label: "Additional notes", value: valText(answers, "add-notes") },
      ],
    },
  ];
}

function rowIsEmpty(value: string | string[] | undefined): boolean {
  return !value || (Array.isArray(value) && value.length === 0) || (typeof value === "string" && value.trim() === "");
}

function rowToPlainText(row: ReportRow): string {
  const display = rowIsEmpty(row.value) ? "Not recorded" : Array.isArray(row.value) ? row.value.join(", ") : row.value;
  return `${row.label}: ${display}`;
}

function sectionsToPlainText(sections: ReportSectionData[]): string {
  return sections
    .map((sec) => `${sec.icon} ${sec.title}\n` + sec.rows.map((r) => "  " + rowToPlainText(r)).join("\n"))
    .join("\n\n");
}

function eeesGroupsToPlainText(groups: EeesGroups): string {
  const parts: string[] = [];
  for (const meta of EEES_META) {
    const items = groups[meta.key];
    if (items.length === 0) continue;
    parts.push(`${meta.icon} ${meta.label}`);
    for (const item of items) {
      if (item.kind === "quote") {
        parts.push(`  In their own words (${item.sectionLabel}): "${item.quote}"`);
      } else {
        parts.push(`  - ${item.reported}: ${item.meaning}`);
        if (item.questions.length) parts.push(`    Questions to explore together: ${item.questions.join(" / ")}`);
        if (item.adjustments.length) parts.push(`    Adjustments to consider: ${item.adjustments.join(" / ")}`);
      }
    }
  }
  return parts.join("\n");
}

/** Plain-text subject + body for the mailto fallback (no webhook configured
 * per CLAUDE.md's email delivery section), built from the same data the
 * on-screen report uses rather than duplicating each report's structure. */
export function buildReportText(
  role: "employee" | "manager" | "hr",
  answers: Answers,
  consent: ConsentMap,
): { subject: string; body: string } {
  const name = valText(answers, "f-name") || "An employee";

  if (role === "employee") {
    return { subject: "Your Workplace Support Passport", body: sectionsToPlainText(buildEmployeeSections(answers, consent)) };
  }

  if (role === "manager") {
    const topThree = valText(answers, "top-three");
    const groups = buildEeesEntries(answers, consent, "manager");
    const parts: string[] = [];
    if (isShared(consent, "priorities", "manager") && topThree) {
      parts.push(`In ${name}'s own words, what matters most:\n"${topThree}"`);
    }
    parts.push(
      hasAnyEeesContent(groups)
        ? eeesGroupsToPlainText(groups)
        : `${name} has not yet shared specific support needs with you through this passport.`,
    );
    return { subject: `Support Conversation Guide for ${name}`, body: parts.join("\n\n") };
  }

  // hr
  const groups = buildEeesEntries(answers, consent, "hr");
  const flags = buildActionFlags(answers, consent, "hr");
  const parts: string[] = [
    "Sharing overview:\n" +
      CONSENT_SECTIONS.map((s) => `  ${s.label}: ${recipientsForSection(consent, s.key).join(", ") || "Not shared"}`).join(
        "\n",
      ),
  ];
  if (flags.length) parts.push("Possible actions for HR:\n" + flags.map((f) => `  - ${f}`).join("\n"));
  parts.push(
    hasAnyEeesContent(groups)
      ? eeesGroupsToPlainText(groups)
      : `${name} has not shared specific support details with HR directly through this passport.`,
  );
  return { subject: `HR Summary for ${name}`, body: parts.join("\n\n") };
}
