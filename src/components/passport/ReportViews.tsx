// The three full reports (employee copy, manager conversation guide, HR
// summary) as JSX, matching reference-prototype.html's renderEmployeeReport
// / renderManagerReport / renderHRReport but split from the underlying data
// builders in report-content.ts, which the plain-text mailto fallback in
// SendByEmailCard.tsx reuses. No dangerouslySetInnerHTML anywhere: every
// answer value is passed through as ordinary React text, which escapes it,
// same effect as the prototype's manual escapeHtml but automatic.

import type { ReactNode } from "react";
import styles from "./reports.module.css";
import { CONSENT_SECTIONS } from "@/lib/passport-content";
import { EEES_META, EEES_POLICY, LEGAL_NOTE, QUOTE_PROMPTS, type EeesTag } from "@/lib/eees-content";
import {
  buildActionFlags,
  buildEeesEntries,
  buildEmployeeSections,
  getRadio,
  hasAnyEeesContent,
  isShared,
  recipientsForSection,
  sectionsNotSharedWith,
  valText,
  type Answers,
  type ConsentMap,
  type EeesGroups,
} from "@/lib/report-content";
import { SHARE_METHOD_FIELD_KEY } from "@/lib/passport-content";

function Row({ label, value }: { label: string; value: string | string[] | undefined }) {
  const isEmpty = !value || (Array.isArray(value) && value.length === 0) || (typeof value === "string" && value.trim() === "");
  if (isEmpty) {
    return (
      <div className={styles.resultRow}>
        <span className={styles.resultQ}>{label}</span>
        <span className={styles.resultEmpty}>Not recorded</span>
      </div>
    );
  }
  return (
    <div className={styles.resultRow}>
      <span className={styles.resultQ}>{label}</span>
      <span className={styles.resultA}>{Array.isArray(value) ? value.join("\n") : value}</span>
    </div>
  );
}

function ReportSection({ icon, title, children }: { icon: string; title: string; children: ReactNode }) {
  return (
    <div className={styles.resultsSection}>
      <div className={styles.resultsSectionHead}>
        <span>{icon}</span>
        <span>{title}</span>
      </div>
      <div className={styles.resultsSectionBody}>{children}</div>
    </div>
  );
}

function SharingTable({ consent }: { consent: ConsentMap }) {
  return (
    <table className={styles.sharingSummaryTable}>
      <thead>
        <tr>
          <th>Area</th>
          <th>Shared with</th>
        </tr>
      </thead>
      <tbody>
        {CONSENT_SECTIONS.map((s) => {
          const recipients = recipientsForSection(consent, s.key);
          return (
            <tr key={s.key}>
              <td>
                {s.icon} {s.label}
              </td>
              <td>
                {recipients.length > 0 ? (
                  recipients.map((r) => (
                    <span className={styles.recipientPill} key={r}>
                      {r}
                    </span>
                  ))
                ) : (
                  <span className={`${styles.recipientPill} ${styles.recipientPillNone}`}>Not shared</span>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

const EEES_HEAD_CLASS: Record<EeesTag, string> = {
  ef: styles.eeesBlockHeadEf,
  er: styles.eeesBlockHeadEr,
  env: styles.eeesBlockHeadEnv,
  sen: styles.eeesBlockHeadSen,
};

function EeesGroupsView({ groups }: { groups: EeesGroups }) {
  return (
    <>
      {EEES_META.map((meta) => {
        const items = groups[meta.key];
        if (items.length === 0) return null;
        return (
          <div className={styles.eeesBlock} key={meta.key}>
            <div className={`${styles.eeesBlockHead} ${EEES_HEAD_CLASS[meta.key]}`}>
              <span>{meta.icon}</span>
              <span>{meta.label}</span>
            </div>
            <div className={styles.eeesBlockBody}>
              <div className={styles.eeesPolicyNote}>{EEES_POLICY[meta.key]}</div>
              {items.map((item, i) =>
                item.kind === "quote" ? (
                  <div className={styles.quoteBox} key={i}>
                    <span className={styles.quoteBoxLabel}>In their own words — {item.sectionLabel}</span>
                    <span className={styles.quoteText}>&ldquo;{item.quote}&rdquo;</span>
                    {QUOTE_PROMPTS[meta.key].length > 0 && (
                      <div className={styles.quotePrompts}>
                        <span className={styles.quotePromptsLabel}>Ways to explore this together:</span>
                        <ul className={styles.quotePromptsList}>
                          {QUOTE_PROMPTS[meta.key].map((q, qi) => (
                            <li key={qi}>{q}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={styles.eeesItem} key={i}>
                    <div className={styles.eeesItemTag}>Directly reported</div>
                    <div className={styles.eeesItemReported}>{item.reported}</div>
                    <div className={styles.eeesItemMeaning}>{item.meaning}</div>
                    {item.questions.length > 0 && (
                      <>
                        <div className={styles.eeesItemSublabel}>💬 Questions to explore together</div>
                        <ul className={styles.eeesSublist}>
                          {item.questions.map((q, qi) => (
                            <li key={qi}>{q}</li>
                          ))}
                        </ul>
                      </>
                    )}
                    {item.adjustments.length > 0 && (
                      <>
                        <div className={styles.eeesItemSublabel}>🛠️ Adjustments to consider</div>
                        <ul className={styles.eeesSublist}>
                          {item.adjustments.map((a, ai) => (
                            <li key={ai}>{a}</li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                ),
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}

export function EmployeeReportBody({ answers, consent }: { answers: Answers; consent: ConsentMap }) {
  const sections = buildEmployeeSections(answers, consent);
  return (
    <>
      {sections.map((section) => (
        <ReportSection icon={section.icon} title={section.title} key={section.title}>
          {section.rows.map((row) => (
            <Row label={row.label} value={row.value} key={row.label} />
          ))}
        </ReportSection>
      ))}
    </>
  );
}

export function ManagerReportBody({ answers, consent }: { answers: Answers; consent: ConsentMap }) {
  const who = valText(answers, "f-name") || "This employee";
  const topThree = valText(answers, "top-three");
  const groups = buildEeesEntries(answers, consent, "manager");
  const hasContent = hasAnyEeesContent(groups);
  const notShared = sectionsNotSharedWith(consent, "manager");

  return (
    <>
      <div className={styles.reportFrameworkNote}>
        <strong>How to read this report:</strong> {who} has organised what helps them work well using the
        EEES framework, Executive Function, Emotional Regulation, Environment and Sensory, the four areas
        that tend to shape how anyone performs at their best. Each item below is something {who} told us
        directly, translated using Which Means What into what it might mean, questions worth asking
        together, and adjustments worth considering. This is not a diagnosis or clinical assessment. You do
        not need to know why something helps, only that it does.
      </div>
      <div className={`${styles.reportFrameworkNote} ${styles.reportFrameworkNotePolicy}`}>{LEGAL_NOTE}</div>

      {isShared(consent, "priorities", "manager") && topThree && (
        <div className={styles.priorityCallout}>
          <div className={styles.priorityCalloutLabel}>In {who}&rsquo;s own words — what matters most</div>
          <p>{topThree}</p>
        </div>
      )}

      {hasContent ? (
        <>
          <EeesGroupsView groups={groups} />
          {notShared.length > 0 && (
            <div className={styles.notSharedNote}>
              {who} has not shared the following areas with you through this passport:{" "}
              {notShared.map((s) => s.label).join(", ")}. That may mean nothing, or it may mean they are
              discussing it with HR or Occupational Health instead, or keeping it private for now.
            </div>
          )}
        </>
      ) : (
        <div className={styles.notSharedNote}>
          {who} has not yet chosen to share specific support needs with you through this passport. It may
          be worth checking in directly, or asking if they would like to revisit their sharing choices.
        </div>
      )}
    </>
  );
}

export function HrReportBody({ answers, consent }: { answers: Answers; consent: ConsentMap }) {
  const who = valText(answers, "f-name") || "This employee";
  const methodVal = getRadio(answers, SHARE_METHOD_FIELD_KEY);
  const topThree = valText(answers, "top-three");
  const flags = buildActionFlags(answers, consent, "hr");
  const groups = buildEeesEntries(answers, consent, "hr");
  const hasContent = hasAnyEeesContent(groups);

  return (
    <>
      <div className={styles.reportFrameworkNote}>
        <strong>About this summary:</strong> This brings together what {who} has chosen to share with HR
        directly, alongside an overview of what has also been shared with their manager or Occupational
        Health, so support can be coordinated without duplicating conversations. It uses the same EEES
        framework and Which Means What translations as the manager report, each with questions to explore
        and adjustments to consider.
      </div>

      {methodVal === "I'd like HR to share it on my behalf" && (
        <div className={styles.reportFrameworkNote}>
          <strong>Action requested:</strong> {who} has asked HR to share the relevant sections of this
          passport with their manager directly.
        </div>
      )}

      <ReportSection icon="🗺️" title="Sharing Overview">
        <SharingTable consent={consent} />
      </ReportSection>

      {isShared(consent, "priorities", "hr") && topThree && (
        <div className={styles.priorityCallout}>
          <div className={styles.priorityCalloutLabel}>In {who}&rsquo;s own words</div>
          <p>{topThree}</p>
        </div>
      )}

      {flags.length > 0 && (
        <ReportSection icon="🚩" title="Possible Actions for HR">
          <ul className={styles.flagList}>
            {flags.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </ReportSection>
      )}

      {hasContent ? (
        <EeesGroupsView groups={groups} />
      ) : (
        <div className={styles.notSharedNote}>
          {who} has not shared specific support details with HR directly through this passport. The
          overview above shows what has been shared elsewhere.
        </div>
      )}
    </>
  );
}
