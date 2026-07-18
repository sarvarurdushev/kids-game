import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "gk_session";

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return new TextEncoder().encode(secret);
}

// Signature + expiry check only, to redirect unauthenticated page loads to
// /login before they render. This is a UX shortcut, not the authorization
// boundary — every route/page still calls requireStudent() itself, which
// also enforces token_version against the DB.
export async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (token) {
    try {
      await jwtVerify(token, getSecretKey());
      return NextResponse.next();
    } catch {
      // fall through to redirect
    }
  }
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: [
    "/home",
    "/packs/:path*",
    "/collection/:path*",
    "/avatar",
    "/achievements",
    "/games/:path*",
    "/room",
  ],
};
