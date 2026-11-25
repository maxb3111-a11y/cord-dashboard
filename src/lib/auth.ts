import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "cord_session";

function signToken(passcode: string): string {
  return crypto
    .createHmac("sha256", passcode)
    .update("cord-second-brain-v1")
    .digest("hex");
}

export function isAuthEnabled(): boolean {
  return Boolean(process.env.CORD_DASHBOARD_PASSCODE?.trim());
}

export async function isAuthenticated(): Promise<boolean> {
  const passcode = process.env.CORD_DASHBOARD_PASSCODE?.trim();
  if (!passcode) return true;
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return false;
  const expected = signToken(passcode);
  try {
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function verifyPasscode(input: string): string | null {
  const passcode = process.env.CORD_DASHBOARD_PASSCODE?.trim();
  if (!passcode) return "dev";
  if (input.trim() !== passcode) return null;
  return signToken(passcode);
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
