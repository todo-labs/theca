import { authenticator } from "otplib";
import { eq, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import { sessions } from "@/lib/db/schema";

authenticator.options = {
  step: 30,
  window: 1,
};

export function verifyTOTP(token: string): boolean {
  if (!process.env.TOTP_SECRET) {
    throw new Error("TOTP_SECRET not configured");
  }

  try {
    return authenticator.verify({
      token,
      secret: process.env.TOTP_SECRET,
    });
  } catch (error) {
    return false;
  }
}

export async function createSession() {
  const expiresAt = new Date(
    Date.now() +
      parseInt(process.env.SESSION_TIMEOUT_HOURS || "24") * 60 * 60 * 1000,
  );

  const sessionToken = crypto.randomUUID();

  const [session] = await db
    .insert(sessions)
    .values({
      token: sessionToken,
      expiresAt,
      lastActive: new Date(),
    })
    .returning();

  return session;
}

export async function verifySession(token: string) {
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.token, token));

  if (!session) return false;
  if (new Date(session.expiresAt) < new Date()) {
    await db.delete(sessions).where(eq(sessions.token, token));
    return false;
  }

  await db
    .update(sessions)
    .set({ lastActive: new Date() })
    .where(eq(sessions.token, token));

  return true;
}

export async function deleteSession(token: string) {
  await db.delete(sessions).where(eq(sessions.token, token));
}

export async function cleanupExpiredSessions() {
  await db.delete(sessions).where(lte(sessions.expiresAt, new Date()));
}

export async function getServerSession(request?: Request) {
  const cookies = request
    ? request.headers.get("cookie")
    : typeof document !== "undefined"
      ? document.cookie
      : "";

  if (!cookies) return null;

  const tokenMatch = cookies.match(/session_token=([^;]+)/);
  if (!tokenMatch) return null;

  const token = tokenMatch[1];
  const isValid = await verifySession(token);
  return isValid ? token : null;
}
