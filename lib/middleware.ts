import type { NextRequest } from "next/server";
import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production"
);

export async function createSession() {
  const token = await new SignJWT({ authenticated: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);

  return token;
}

export async function verifySession(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return !!payload.authenticated;
  } catch {
    return false;
  }
}

export async function requireAuth(request: NextRequest) {
  const token = request.cookies.get("session_token")?.value;

  if (!token) {
    return { error: "No session token", isAuthenticated: false };
  }

  const isValid = await verifySession(token);

  if (!isValid) {
    return { error: "Invalid or expired session", isAuthenticated: false };
  }

  return { isAuthenticated: true };
}
