import Link from "next/link";
import passportStyles from "@/components/passport/passport.module.css";
import styles from "@/components/passport/admin.module.css";
import { ADMIN_RECIPIENTS, adminRecipientLabel, listSharedPassports } from "@/lib/admin-data";

// Live per request: the shared-passport counts below change as employees
// update their sharing choices.
export const dynamic = "force-dynamic";

const ROLE_ICONS = { manager: "🧭", hr: "📊" } as const;

export default async function AdminLandingPage() {
  const counts = await Promise.all(ADMIN_RECIPIENTS.map((recipient) => listSharedPassports(recipient)));

  return (
    <>
      <header className="site-header">
        <h1>Manager &amp; HR View</h1>
        <p>Passports shared with you, and the themes coming through across the people you support.</p>
      </header>
      <div className="container">
        <div className={passportStyles.notice}>
          <strong>Demo stand-in</strong>
          This view is not yet behind a sign-in, real authentication for managers and HR is the next build
          step. Pick a role below to see what they would see once signed in.
        </div>

        <div className={styles.roleGrid}>
          {ADMIN_RECIPIENTS.map((recipient, i) => (
            <Link href={`/admin/${recipient}`} className={styles.roleCard} key={recipient}>
              <span className={styles.roleCardIcon}>{ROLE_ICONS[recipient]}</span>
              <span className={styles.roleCardTitle}>View as {adminRecipientLabel(recipient)}</span>
              <span className={styles.roleCardCount}>
                {counts[i].length} passport{counts[i].length === 1 ? "" : "s"} shared with you
              </span>
            </Link>
          ))}
        </div>

        <div className={styles.pageActions}>
          <Link href="/" className={`${passportStyles.btn} ${passportStyles.btnSecondary}`}>
            ← Back to your own passport
          </Link>
        </div>
      </div>
    </>
  );
}
