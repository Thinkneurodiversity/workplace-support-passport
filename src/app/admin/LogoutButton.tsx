"use client";

import { logout } from "@/lib/admin-auth-actions";

export default function LogoutButton() {
  return (
    <form action={logout}>
      <button type="submit">Log out</button>
    </form>
  );
}
