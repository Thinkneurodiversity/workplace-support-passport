import Link from "next/link";
import { notFound } from "next/navigation";
import passportStyles from "@/components/passport/passport.module.css";
import styles from "@/components/passport/admin.module.css";
import {
  adminRecipientLabel,
  buildAggregateThemes,
  isAdminRecipient,
  listSharedPassports,
  type AdminRecipient,
} from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminRecipientPage({ params }: { params: Promise<{ recipient: string }> }) {
  const { recipient: recipientParam } = await params;
  if (!isAdminRecipient(recipientParam)) notFound();
  const recipient: AdminRecipient = recipientParam;
  const label = adminRecipientLabel(recipient);

  const [passports, themes] = await Promise.all([listSharedPassports(recipient), buildAggregateThemes(recipient)]);

  return (
    <>
      <header className="site-header">
        <h1>{label} View</h1>
        <p>Passports shared with {label}, and the themes coming through across the team.</p>
      </header>
      <div className="container">
        <div className={passportStyles.notice}>
          <strong>Demo stand-in</strong>
          This view is not yet behind a sign-in, see the build order in CLAUDE.md for the real thing.
        </div>

        <section>
          <h2 className={styles.sectionTitle}>Shared Passports</h2>
          {passports.length === 0 ? (
            <div className={styles.emptyState}>No passports have been shared with {label} yet.</div>
          ) : (
            <div className={styles.passportList}>
              {passports.map((p) => (
                <Link href={`/admin/${recipient}/${p.id}`} className={styles.passportCard} key={p.id}>
                  <div className={styles.passportCardTop}>
                    <div>
                      <div className={styles.passportName}>{p.name}</div>
                      {p.role && <div className={styles.passportRole}>{p.role}</div>}
                    </div>
                    <span
                      className={`${styles.statusBadge} ${
                        p.status === "complete" ? styles.statusComplete : styles.statusDraft
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                  <div className={styles.passportSections}>
                    {p.sharedSections.map((s) => (
                      <span className={styles.sectionPill} key={s.key}>
                        {s.icon} {s.label}
                      </span>
                    ))}
                  </div>
                  <div className={styles.passportUpdated}>
                    Updated{" "}
                    {p.lastUpdatedAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className={styles.sectionTitle}>Aggregate Themes</h2>
          <p className={styles.sectionHint}>
            Counts drawn from checkbox answers in sections shared with {label} only, e.g. how many people
            selected a given option. Free-text answers are never summarised here, they stay visible only
            within an individual passport that has been shared with you.
          </p>
          {themes.length === 0 ? (
            <div className={styles.emptyState}>Not enough shared passports yet to show themes.</div>
          ) : (
            themes.map((section) => (
              <div className={styles.themeSection} key={section.key}>
                <div className={styles.themeSectionHead}>
                  <span>{section.icon}</span>
                  <span>{section.label}</span>
                </div>
                {section.fields.map((field) => (
                  <div className={styles.themeField} key={field.fieldKey}>
                    <div className={styles.themeFieldLabel}>
                      <span>{field.label}</span>
                      <span className={styles.themeFieldMeta}>
                        {field.respondents} respondent{field.respondents === 1 ? "" : "s"}
                      </span>
                    </div>
                    {field.options.map((option) => (
                      <div className={styles.themeBarRow} key={option.value}>
                        <span className={styles.themeBarLabel}>{option.label}</span>
                        <div className={styles.themeBarTrack}>
                          <div
                            className={styles.themeBarFill}
                            style={{ width: `${Math.round((option.count / field.respondents) * 100)}%` }}
                          />
                        </div>
                        <span className={styles.themeBarCount}>{option.count}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))
          )}
        </section>

        <div className={styles.pageActions}>
          <Link href="/admin" className={`${passportStyles.btn} ${passportStyles.btnSecondary}`}>
            ← Choose a different role
          </Link>
        </div>
      </div>
    </>
  );
}
