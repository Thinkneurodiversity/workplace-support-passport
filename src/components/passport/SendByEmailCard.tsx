"use client";

import { useState } from "react";
import styles from "./reports.module.css";
import passportStyles from "./passport.module.css";
import { CONSENT_SECTIONS, RECIPIENT_EMAIL_FIELD_KEYS } from "@/lib/passport-content";
import { buildReportText, isShared, valText, type Answers, type ConsentMap } from "@/lib/report-content";

// Per CLAUDE.md's email delivery section: real sending goes via a
// client-configured webhook, with mailto as a fallback if none is
// configured. No webhook exists yet (that's per-organisation config, not
// built here), so this is the fallback path only, opens the employee's own
// email app pre-filled with the right report for that person, matching
// reference-prototype.html's behaviour when EMAIL_WEBHOOK_URL is unset.

const ROLE_META = {
  employee: { label: "You", icon: "🗂️" },
  manager: { label: "Manager", icon: "🧭" },
  hr: { label: "HR", icon: "📊" },
} as const;

type Role = keyof typeof ROLE_META;

function recipientEmail(role: Role, answers: Answers): string {
  if (role === "employee") return valText(answers, "f-email");
  if (role === "manager") return valText(answers, RECIPIENT_EMAIL_FIELD_KEYS.manager!);
  return valText(answers, RECIPIENT_EMAIL_FIELD_KEYS.hr!);
}

function recipientHasContent(role: Role, consent: ConsentMap): boolean {
  if (role === "employee") return true;
  return CONSENT_SECTIONS.some((s) => isShared(consent, s.key, role));
}

// mailto URLs have no formal length limit but many mail clients and OSes
// start truncating or refusing well before that, matching the prototype's
// own cutoff for the same reason.
const MAX_MAILTO_BODY = 1600;

export default function SendByEmailCard({ answers, consent }: { answers: Answers; consent: ConsentMap }) {
  const [statusByRole, setStatusByRole] = useState<Partial<Record<Role, string>>>({});
  const roles = (Object.keys(ROLE_META) as Role[]).filter((r) => recipientHasContent(r, consent));

  function openEmail(role: Role) {
    const email = recipientEmail(role, answers);
    if (!email) {
      setStatusByRole((s) => ({ ...s, [role]: "Add an email address for this person first." }));
      return;
    }
    const { subject, body } = buildReportText(role, answers, consent);
    const truncated =
      body.length > MAX_MAILTO_BODY
        ? body.slice(0, MAX_MAILTO_BODY) + "\n\n… (continued, see the printed PDF for the full report)"
        : body;
    const mailto = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(truncated)}`;
    window.location.assign(mailto);
    setStatusByRole((s) => ({ ...s, [role]: "Opening your email app…" }));
  }

  if (roles.length === 0) {
    return (
      <p className={passportStyles.consentIntro}>
        Nothing has been shared with anyone yet, so there is nothing to send. Go back and add sharing
        choices, or just open your own copy above.
      </p>
    );
  }

  return (
    <div>
      <p className={passportStyles.consentIntro} style={{ marginBottom: 12 }}>
        Automatic sending is not configured on this instance. &ldquo;Open email&rdquo; pre-fills your email
        app with the right report for that person, ready to send, only for what you have chosen to share
        with them.
      </p>
      {roles.map((role) => {
        const email = recipientEmail(role, answers);
        const meta = ROLE_META[role];
        return (
          <div className={styles.sendRow} key={role}>
            <div className={styles.sendRowLabel}>
              {meta.icon} {meta.label}
              {email ? ` · ${email}` : ""}
              {!email && <span className={styles.sendRowNoEmail}> no email added</span>}
            </div>
            <button
              type="button"
              className={`${passportStyles.btn} ${passportStyles.btnSecondary} ${styles.btnSmall}`}
              onClick={() => openEmail(role)}
              disabled={!email}
            >
              Open email
            </button>
            {statusByRole[role] && <div className={styles.sendStatus}>{statusByRole[role]}</div>}
          </div>
        );
      })}
    </div>
  );
}
