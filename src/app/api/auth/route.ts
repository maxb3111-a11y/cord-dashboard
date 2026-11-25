import { NextResponse } from "next/server";
import {
  isAuthenticated,
  isAuthEnabled,
  SESSION_COOKIE_NAME,
  verifyPasscode,
} from "@/lib/auth";

export async function GET() {
  const authed = await isAuthenticated();
  return NextResponse.json({
    authenticated: authed,
    authRequired: isAuthEnabled(),
  });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    passcode?: string;
  };
  const token = verifyPasscode(body.passcode || "");
  if (!token) {
    return NextResponse.json(
      { ok: false, error: "Invalid passcode" },
      { status: 401 }
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE_NAME);
  return res;
}
