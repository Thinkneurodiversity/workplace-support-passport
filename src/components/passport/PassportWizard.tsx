"use client";

import { useCallback, useState } from "react";
import styles from "./passport.module.css";
import FieldRenderer from "./FieldRenderer";
import {
  CONSENT_SECTIONS,
  RECIPIENTS,
  RECIPIENT_EMAIL_FIELD_KEYS,
  SECTIONS,
  SHARE_METHOD_FIELD_KEY,
  SHARE_METHOD_OPTIONS,
  SHARE_METHOD_OTHER_FIELD_KEY,
  isFieldVisible,
  type RecipientKey,
} from "@/lib/passport-content";
import { completePassport, saveConsent, saveConsentBulk, saveResponse } from "@/lib/passport-actions";

type AnswerValue = string | string[];
type Answers = Record<string, AnswerValue>;
type ConsentMap = Record<string, Partial<Record<RecipientKey, boolean>>>;

interface Props {
  passportId: string;
  initialAnswers: Answers;
  initialConsent: ConsentMap;
}

// SECTIONS (the 8 content sections) plus one synthetic step for sharing
// and consent, matching reference-prototype.html's "Section X of 9".
const TOTAL_STEPS = SECTIONS.length + 1;

/** The full 8-step passport flow plus the sharing/consent step, as a
 * client-side wizard over the section content in passport-content.ts.
 * Answers save to the database as the user progresses (on blur for text
 * fields, immediately for checkbox/radio tiles), not just at the end, per
 * CLAUDE.md build step 2. */
export default function PassportWizard({ passportId, initialAnswers, initialConsent }: Props) {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [consent, setConsent] = useState<ConsentMap>(initialConsent);
  const [saveStatus, setSaveStatus] = useState("");
  const [completed, setCompleted] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const currentStepNumber = stepIndex + 1;
  const isSharingStep = stepIndex === SECTIONS.length;
  const section = isSharingStep ? null : SECTIONS[stepIndex];
  const pct = Math.round((currentStepNumber / TOTAL_STEPS) * 100);

  // Fire-and-forget: the UI never blocks on a save completing, saveStatus
  // just reflects the outcome once it lands. Good enough for a single-user
  // draft with autosave; a failed save leaves the (unsaved) value visible
  // on screen rather than silently discarding it.
  const persistResponse = useCallback(
    (fieldKey: string, value: AnswerValue) => {
      setSaveStatus("Saving...");
      saveResponse(passportId, fieldKey, value)
        .then(() => setSaveStatus("Saved"))
        .catch(() => setSaveStatus("Could not save, check your connection"));
    },
    [passportId],
  );

  function handleChange(key: string, value: AnswerValue, opts?: { saveImmediately?: boolean }) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    if (opts?.saveImmediately) persistResponse(key, value);
  }

  function handleBlur(key: string) {
    persistResponse(key, answers[key] ?? "");
  }

  function setConsentCell(sectionKey: string, recipient: RecipientKey, shared: boolean) {
    setConsent((prev) => ({ ...prev, [sectionKey]: { ...prev[sectionKey], [recipient]: shared } }));
    setSaveStatus("Saving...");
    saveConsent(passportId, sectionKey, recipient, shared)
      .then(() => setSaveStatus("Saved"))
      .catch(() => setSaveStatus("Could not save, check your connection"));
  }

  function shareEverythingWith(recipient: RecipientKey) {
    setConsent((prev) => {
      const next = { ...prev };
      for (const s of CONSENT_SECTIONS) next[s.key] = { ...next[s.key], [recipient]: true };
      return next;
    });
    setSaveStatus("Saving...");
    saveConsentBulk(
      passportId,
      CONSENT_SECTIONS.map((s) => ({ section: s.key, recipient, shared: true })),
    )
      .then(() => setSaveStatus("Saved"))
      .catch(() => setSaveStatus("Could not save, check your connection"));
  }

  function clearAllConsent() {
    setConsent({});
    setSaveStatus("Saving...");
    saveConsentBulk(
      passportId,
      CONSENT_SECTIONS.flatMap((s) => RECIPIENTS.map((r) => ({ section: s.key, recipient: r.key, shared: false }))),
    )
      .then(() => setSaveStatus("Saved"))
      .catch(() => setSaveStatus("Could not save, check your connection"));
  }

  function goNext() {
    setStepIndex((i) => Math.min(i + 1, TOTAL_STEPS - 1));
    setSaveStatus("");
  }
  function goBack() {
    setStepIndex((i) => Math.max(i - 1, 0));
    setSaveStatus("");
  }

  async function handleGenerateReports() {
    setIsCompleting(true);
    try {
      await completePassport(passportId);
      setCompleted(true);
    } finally {
      setIsCompleting(false);
    }
  }

  const isSharedWith = useCallback(
    (recipient: RecipientKey) => CONSENT_SECTIONS.some((s) => consent[s.key]?.[recipient]),
    [consent],
  );

  if (completed) {
    return (
      <div className={styles.confirmation}>
        <h2>Your passport is complete</h2>
        <p>
          Your answers and sharing choices are saved. Report generation, a printable copy for you and a
          tailored report for each recipient you have chosen, is built next, so for now this confirms
          your passport is ready.
        </p>
        <div style={{ marginTop: 20 }}>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnSecondary}`}
            style={{ background: "white" }}
            onClick={() => setCompleted(false)}
          >
            ← Back to edit answers
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.notice}>
        <strong>Your passport, your information</strong>
        You do not need to disclose a diagnosis or medical condition at any point. This passport focuses
        on what helps you work well. You choose what to share, with whom, and when.
      </div>

      <div className={styles.progressWrap}>
        <div className={styles.progressLabel}>
          <span>
            Section {currentStepNumber} of {TOTAL_STEPS}
          </span>
          <span>{pct}%</span>
        </div>
        <div
          className={styles.progressTrack}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className={styles.progressFill} style={{ width: `${pct}%` }} />
        </div>
      </div>

      {section && (
        <div className={styles.sectionCard} key={section.key}>
          <div className={styles.stepCount}>
            Section {currentStepNumber} of {TOTAL_STEPS}
          </div>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon}>{section.icon}</div>
            <div>
              <div className={styles.sectionTitle}>{section.title}</div>
              <div className={styles.sectionDesc}>{section.description}</div>
            </div>
          </div>
          {section.fields
            .filter((f) => isFieldVisible(f, answers))
            .map((f) => (
              <FieldRenderer key={f.key} field={f} value={answers[f.key]} onChange={handleChange} onBlur={handleBlur} />
            ))}
        </div>
      )}

      {isSharingStep && (
        <div className={styles.sectionCard}>
          <div className={styles.stepCount}>
            Section {currentStepNumber} of {TOTAL_STEPS}
          </div>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon}>🔒</div>
            <div>
              <div className={styles.sectionTitle}>Sharing Your Passport</div>
              <div className={styles.sectionDesc}>
                You choose exactly who sees what. Nothing is sent automatically, generating your passport
                just prepares the documents for you to share yourself.
              </div>
            </div>
          </div>

          <p className={styles.consentIntro}>
            For each area below, tick who you are happy to share it with. Leave a box unticked to keep
            that area out of that person&rsquo;s report. Your own copy always includes everything you
            have entered, whatever you choose here.
          </p>

          <div className={styles.consentQuickrow}>
            <button type="button" className={styles.chipBtn} onClick={() => shareEverythingWith("manager")}>
              Share everything with Manager
            </button>
            <button type="button" className={styles.chipBtn} onClick={() => shareEverythingWith("hr")}>
              Share everything with HR
            </button>
            <button
              type="button"
              className={styles.chipBtn}
              onClick={() => shareEverythingWith("occupational_health")}
            >
              Share everything with Occ. Health
            </button>
            <button type="button" className={`${styles.chipBtn} ${styles.chipBtnClear}`} onClick={clearAllConsent}>
              Clear all
            </button>
          </div>

          <div className={styles.consentTableWrap}>
            <table className={styles.consentTable}>
              <thead>
                <tr>
                  <th>Area</th>
                  {RECIPIENTS.map((r) => (
                    <th key={r.key}>{r.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CONSENT_SECTIONS.map((s) => (
                  <tr key={s.key}>
                    <td>
                      {s.icon} {s.label}
                    </td>
                    {RECIPIENTS.map((r) => (
                      <td key={r.key}>
                        <input
                          type="checkbox"
                          checked={consent[s.key]?.[r.key] ?? false}
                          onChange={(e) => setConsentCell(s.key, r.key, e.target.checked)}
                          aria-label={`Share ${s.label} with ${r.label}`}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className={styles.consentHintRow}>
                  <td colSpan={4}>
                    &ldquo;About You&rdquo; details (name, role, contact) are included automatically
                    wherever you share something, so whoever you share with knows whose passport it is.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className={styles.field} style={{ marginTop: 8 }}>
            <FieldRenderer
              field={{
                key: SHARE_METHOD_FIELD_KEY,
                type: "radio-group",
                label: "How would you like this passport shared?",
                optionalTag: "optional",
                options: SHARE_METHOD_OPTIONS,
              }}
              value={answers[SHARE_METHOD_FIELD_KEY]}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {answers[SHARE_METHOD_FIELD_KEY] === "Other" && (
              <div className={styles.conditional}>
                <FieldRenderer
                  field={{
                    key: SHARE_METHOD_OTHER_FIELD_KEY,
                    type: "text",
                    label: "Please specify",
                    optionalTag: "optional",
                    placeholder: "How would you like this shared?",
                  }}
                  value={answers[SHARE_METHOD_OTHER_FIELD_KEY]}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </div>
            )}
          </div>

          <div className={styles.field}>
            <div className={styles.label}>
              Recipient email addresses <span className={styles.optionalTag}>optional</span>
            </div>
            <div className={styles.fieldHint}>
              Only needed if you would like reports emailed automatically once generated. These fields
              appear once you have shared at least one area above with that person. You can still open,
              print or save every report yourself without filling these in.
            </div>
            {isSharedWith("manager") && (
              <div className={styles.conditional} style={{ marginTop: 10 }}>
                <FieldRenderer
                  field={{ key: RECIPIENT_EMAIL_FIELD_KEYS.manager!, type: "email", label: "Manager's email" }}
                  value={answers[RECIPIENT_EMAIL_FIELD_KEYS.manager!]}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </div>
            )}
            {isSharedWith("hr") && (
              <div className={styles.conditional} style={{ marginTop: 10 }}>
                <FieldRenderer
                  field={{ key: RECIPIENT_EMAIL_FIELD_KEYS.hr!, type: "email", label: "HR email" }}
                  value={answers[RECIPIENT_EMAIL_FIELD_KEYS.hr!]}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </div>
            )}
          </div>

          <button
            type="button"
            className={`${styles.btn} ${styles.btnAmber}`}
            style={{ marginTop: 20 }}
            onClick={handleGenerateReports}
            disabled={isCompleting}
          >
            {isCompleting ? "Generating…" : "Generate My Reports"}
          </button>
        </div>
      )}

      <div className={styles.saveStatus} aria-live="polite">
        {saveStatus}
      </div>

      {!isSharingStep && (
        <div className={styles.navRow}>
          {stepIndex > 0 ? (
            <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={goBack}>
              ← Back
            </button>
          ) : (
            <span />
          )}
          <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={goNext}>
            Continue →
          </button>
        </div>
      )}
      {isSharingStep && (
        <div className={styles.navRow}>
          <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={goBack}>
            ← Back
          </button>
          <span />
        </div>
      )}
    </>
  );
}
