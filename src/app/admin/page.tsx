import { redirect } from "next/navigation";
import { getAdminSessionUser, recipientForRole } from "@/lib/admin-session";

// A signed-in manager or HR user only ever has one recipient view (their own
// role), so there's nothing to choose here, unlike the pre-login version of
// this page which let a demo visitor preview either role. Real accounts
// replace that preview, they just get sent straight to their own view.
export default async function AdminLandingPage() {
  const user = await getAdminSessionUser();
  if (!user) redirect("/admin/login");

  const recipient = recipientForRole(user.role);
  redirect(recipient ? `/admin/${recipient}` : "/admin/login");
}
