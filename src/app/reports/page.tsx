import Link from "next/link";
import { redirect } from "next/navigation";
import passportStyles from "@/components/passport/passport.module.css";
import styles from "@/components/passport/reports.module.css";
import SendByEmailCard from "@/components/passport/SendByEmailCard";
import { loadOwnPassport, toAnswersAndConsent } from "@/lib/passport-session";

export const dynamic = "force-dynamic";

const REPORT_CARDS = [
  {
    type: "employee",
    icon: "🗂️",
    title: "Your Copy",
    desc: "A complete record of everything you've entered, plus a clear summary of who you've chosen to share each part with and how. This is for you to keep.",
  },
  {
    type: "manager",
    icon: "🧭",
    title: "Manager Report",
    desc: "Only includes what you've chosen to share with your manager, organised using the EEES framework with practical conversation points from Which Means What.",
  },
  {
    type: "hr",
    icon: "📊",
    title: "HR Summary",
    desc: "An overview for HR of what's been shared with them directly, plus what's also going to the manager or Occupational Health, and any actions that may need HR's help.",
  },
] as const;

export default async function ReportsPage() {
  const passport = await loadOwnPassport();
  if (!passport) redirect("/api/passport/bootstrap");

  const { answers, consent } = toAnswersAndConsent(passport);

  return (
    <>
      <header className="site-header">
        <h1>Workplace Support Passport</h1>
        <p>A practical tool to help you identify, articulate and record what you need to work at your best.</p>
      </header>
      <div className="container">
        <div className={styles.selectorIntro}>
          <h2>Your Reports Are Ready</h2>
          <p>
            Three separate documents have been prepared. Open, review and print each one on its own, only
            sharing them with the people you have chosen.
          </p>
        </div>

        {REPORT_CARDS.map((card) => (
          <div className={styles.reportCard} key={card.type}>
            <div className={styles.reportCardTop}>
              <span className={styles.reportCardIcon}>{card.icon}</span>
              <span className={styles.reportCardTitle}>{card.title}</span>
            </div>
            <p className={styles.reportCardDesc}>{card.desc}</p>
            <Link href={`/reports/${card.type}`} className={`${passportStyles.btn} ${passportStyles.btnPrimary}`}>
              Open {card.title} →
            </Link>
          </div>
        ))}

        <div className={styles.reportCard}>
          <div className={styles.reportCardTop}>
            <span className={styles.reportCardIcon}>✉️</span>
            <span className={styles.reportCardTitle}>Send by Email</span>
          </div>
          <SendByEmailCard answers={answers} consent={consent} />
        </div>

        <div className={styles.printRow}>
          <Link href="/" className={`${passportStyles.btn} ${passportStyles.btnSecondary}`}>
            ← Back to edit answers
          </Link>
        </div>
      </div>
    </>
  );
}
