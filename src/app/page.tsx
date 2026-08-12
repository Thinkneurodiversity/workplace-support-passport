import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PassportWizard from "@/components/passport/PassportWizard";
import type { RecipientKey } from "@/lib/passport-content";
import { PASSPORT_COOKIE, loadPassport } from "@/lib/passport-session";

// Live per request: this reads the passport for whichever cookie the
// browser sent, so it can never be a static/cached page.
export const dynamic = "force-dynamic";

export default async function Home() {
  const cookieStore = await cookies();
  const passportId = cookieStore.get(PASSPORT_COOKIE)?.value;
  const passport = passportId ? await loadPassport(passportId) : null;

  if (!passport) {
    // No cookie yet, or a stale one left over from a reset database. Server
    // Components can read cookies but not set them, so a fresh draft is
    // created by the bootstrap route handler, which can, then sends the
    // browser back here.
    redirect("/api/passport/bootstrap");
  }

  const initialAnswers: Record<string, string | string[]> = {};
  for (const response of passport.responses) {
    initialAnswers[response.fieldKey] = response.value as unknown as string | string[];
  }

  const initialConsent: Record<string, Partial<Record<RecipientKey, boolean>>> = {};
  for (const entry of passport.consent) {
    const recipient = entry.recipient as RecipientKey;
    initialConsent[entry.section] = { ...initialConsent[entry.section], [recipient]: entry.shared };
  }

  return (
    <>
      <header className="site-header">
        <h1>Workplace Support Passport</h1>
        <p>A practical tool to help you identify, articulate and record what you need to work at your best.</p>
      </header>
      <div className="container">
        <PassportWizard passportId={passport.id} initialAnswers={initialAnswers} initialConsent={initialConsent} />
      </div>
    </>
  );
}
