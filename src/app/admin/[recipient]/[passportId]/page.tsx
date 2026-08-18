import Link from "next/link";
import { notFound } from "next/navigation";
import passportStyles from "@/components/passport/passport.module.css";
import reportStyles from "@/components/passport/reports.module.css";
import { HrReportBody, ManagerReportBody } from "@/components/passport/ReportViews";
import { adminRecipientLabel, isAdminRecipient, loadSharedPassport, type AdminRecipient } from "@/lib/admin-data";
import { hrHeaderLines, managerHeaderLines } from "@/lib/report-content";

export const dynamic = "force-dynamic";

// Reuses the exact same report bodies the employee's own "manager"/"hr"
// report pages render (see reports/[type]/page.tsx), built from the same
// answers/consent shape, so a manager or HR admin sees precisely what the
// employee already previewed before sharing, nothing extra.
export default async function AdminPassportPage({
  params,
}: {
  params: Promise<{ recipient: string; passportId: string }>;
}) {
  const { recipient: recipientParam, passportId } = await params;
  if (!isAdminRecipient(recipientParam)) notFound();
  const recipient: AdminRecipient = recipientParam;
  const label = adminRecipientLabel(recipient);

  const record = await loadSharedPassport(passportId, recipient);
  if (!record) notFound();

  const { answers, consent, name } = record;
  const headerLines = recipient === "manager" ? managerHeaderLines(answers) : hrHeaderLines(answers);

  return (
    <>
      <header className="site-header">
        <h1>Workplace Support Passport</h1>
        <p>
          {label} view for {name}.
        </p>
      </header>
      <div className="container">
        <div className={reportStyles.resultsHeader}>
          <h2>{recipient === "manager" ? "Support Conversation Guide" : "HR Summary"}</h2>
          {headerLines.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>

        {recipient === "manager" ? (
          <ManagerReportBody answers={answers} consent={consent} />
        ) : (
          <HrReportBody answers={answers} consent={consent} />
        )}

        <div className={reportStyles.reportNavRow}>
          <Link href={`/admin/${recipient}`} className={`${passportStyles.btn} ${passportStyles.btnSecondary}`}>
            ← Back to {label} view
          </Link>
        </div>
      </div>
    </>
  );
}
