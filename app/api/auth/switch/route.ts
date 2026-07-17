import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth/session";

// Functionally identical to logout: drops the session cookie so the client
// falls back to the avatar-grid picker (still backed by the gk_family
// cookie) instead of forcing a full re-enrollment.
export async function POST() {
  await clearSession();
  return NextResponse.json({ ok: true });
}
