import { redirect } from "next/navigation";
import passportStyles from "@/components/passport/passport.module.css";
import styles from "@/components/passport/admin.module.css";
import LoginForm from "./LoginForm";
import { DEMO_LOGIN_HINTS, ensureDemoAdminAccounts, getAdminSessionUser, recipientForRole } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  // Lazily creates the demo manager/HR accounts on first visit, so a fresh
  // clone works immediately, see admin-session.ts.
  await ensureDemoAdminAccounts();

  const user = await getAdminSessionUser();
  if (user) {
    const recipient = recipientForRole(user.role);
    redirect(recipient ? `/admin/${recipient}` : "/");
  }

  return (
    <>
      <header className="site-header">
        <h1>Manager &amp; HR Sign In</h1>
        <p>Sign in to see the passports your team has chosen to share with you.</p>
      </header>
      <div className="container">
        <div className={passportStyles.notice}>
          <strong>Demo stand-in</strong>
          This is a simple email/password login for demo purposes only, not the real single sign-on a client
          deployment would use. Try one of the accounts below.
        </div>

        <div className={styles.credentialsBox}>
          {DEMO_LOGIN_HINTS.map((hint) => (
            <div key={hint.email}>
              <strong>{hint.email}</strong> &nbsp;/&nbsp; {hint.password}
            </div>
          ))}
        </div>

        <div className={styles.loginCard}>
          <LoginForm />
        </div>
      </div>
    </>
  );
}
