"use client";

import { useActionState } from "react";
import passportStyles from "@/components/passport/passport.module.css";
import styles from "@/components/passport/admin.module.css";
import { login, type LoginState } from "@/lib/admin-auth-actions";

const initialState: LoginState = {};

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction}>
      {state?.error && <p className={styles.formError}>{state.error}</p>}

      <div className={passportStyles.field}>
        <label className={passportStyles.label} htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className={passportStyles.textInput}
        />
      </div>

      <div className={passportStyles.field}>
        <label className={passportStyles.label} htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={passportStyles.textInput}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className={`${passportStyles.btn} ${passportStyles.btnAmber}`}
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
