import { redirect } from "next/navigation";
import PassportWizard from "@/components/passport/PassportWizard";
import { loadOwnPassport, toAnswersAndConsent } from "@/lib/passport-session";

// Live per request: this reads the passport for whichever cookie the
// browser sent, so it can never be a static/cached page.
export const dynamic = "force-dynamic";

export default async function Home() {
  const passport = await loadOwnPassport();

  if (!passport) {
    // No cookie yet, or a stale one left over from a reset database. Server
    // Components can read cookies but not set them, so a fresh draft is
    // created by the bootstrap route handler, which can, then sends the
    // browser back here.
    redirect("/api/passport/bootstrap");
  }

  const { answers, consent } = toAnswersAndConsent(passport);

  return (
    <>
      <header className="site-header">
        <h1>Workplace Support Passport</h1>
        <p>A practical tool to help you identify, articulate and record what you need to work at your best.</p>
      </header>
      <div className="container">
        <PassportWizard passportId={passport.id} initialAnswers={answers} initialConsent={consent} />
      </div>
    </>
  );
}
