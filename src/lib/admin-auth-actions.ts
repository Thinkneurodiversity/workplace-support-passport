"use server";

import { redirect } from "next/navigation";
import { destroyAdminSession, recipientForRole, signInWithPassword } from "@/lib/admin-session";

export interface LoginState {
  error?: string;
}

/** Server Action behind the login form, driven by useActionState so the
 * form can show an error without a full navigation. Redirects straight into
 * the recipient view that matches the signed-in user's role on success. */
export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter both an email and a password." };
  }

  const user = await signInWithPassword(email, password);
  if (!user) {
    return { error: "Incorrect email or password." };
  }

  const recipient = recipientForRole(user.role);
  redirect(recipient ? `/admin/${recipient}` : "/admin/login");
}

export async function logout(): Promise<void> {
  await destroyAdminSession();
  redirect("/admin/login");
}
