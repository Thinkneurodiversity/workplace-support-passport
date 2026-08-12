import { NextResponse } from "next/server";
import { createPassportSession, PASSPORT_COOKIE } from "@/lib/passport-session";

// Server Components can read cookies but not set them, so the "no passport
// cookie yet" case in the home page redirects here: a Route Handler, which
// can. This is a GET (so a plain redirect() from the page reaches it) that
// writes to the database, unusual for a GET but this is an internal
// implementation detail rather than a public API, not a REST resource.
export async function GET(request: Request) {
  const passportId = await createPassportSession();
  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.set(PASSPORT_COOKIE, passportId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}
