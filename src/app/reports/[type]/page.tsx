import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import passportStyles from "@/components/passport/passport.module.css";
import styles from "@/components/passport/reports.module.css";
import PrintButton from "@/components/passport/PrintButton";
import { EmployeeReportBody, HrReportBody, ManagerReportBody } from "@/components/passport/ReportViews";
import { loadOwnPassport, toAnswersAndConsent } from "@/lib/passport-session";
import { employeeHeaderLines, hrHeaderLines, managerHeaderLines } from "@/lib/report-content";

export const dynamic = "force-dynamic";

const REPORT_META = {
  employee: { title: "Your Workplace Support Passport", headerLines: employeeHeaderLines },
  manager: { title: "Support Conversation Guide", headerLines: managerHeaderLines },
  hr: { title: "HR Summary", headerLines: hrHeaderLines },
} as const;

type ReportType = keyof typeof REPORT_META;

function isReportType(value: string): value is ReportType {
  return value in REPORT_META;
}

export default async function ReportPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  if (!isReportType(type)) notFound();

  const passport = await loadOwnPassport();
  if (!passport) redirect("/api/passport/bootstrap");

  const { answers, consent } = toAnswersAndConsent(passport);
  const meta = REPORT_META[type];
  const headerLines = meta.headerLines(answers);

  return (
    <>
      <header className="site-header">
        <h1>Workplace Support Passport</h1>
        <p>A practical tool to help you identify, articulate and record what you need to work at your best.</p>
      </header>
      <div className="container">
        <div className={styles.resultsHeader}>
          <h2>{meta.title}</h2>
          {headerLines.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>

        {type === "employee" && <EmployeeReportBody answers={answers} consent={consent} />}
        {type === "manager" && <ManagerReportBody answers={answers} consent={consent} />}
        {type === "hr" && <HrReportBody answers={answers} consent={consent} />}

        <div className={styles.reportNavRow}>
          <Link href="/reports" className={`${passportStyles.btn} ${passportStyles.btnSecondary}`}>
            ← Back to your reports
          </Link>
          <PrintButton className={`${passportStyles.btn} ${passportStyles.btnPrimary}`}>
            Print / Save as PDF
          </PrintButton>
        </div>
      </div>
    </>
  );
}
