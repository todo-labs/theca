import type { NextRequest } from "next/server";
import { verifySession } from "@/lib/auth";

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
