import { NextRequest, NextResponse } from "next/server";
import { verifyTOTP, createSession, deleteSession } from "@/lib/auth";
import { verifySession } from "@/lib/middleware";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    const isValid = verifyTOTP(token, process.env.TOTP_SECRET || "");

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    const session = await createSession();

    const response = NextResponse.json({ success: true });
    response.cookies.set("session_token", session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: parseInt(process.env.SESSION_TIMEOUT_HOURS || "24") * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("session_token")?.value;

    if (!token) {
      return NextResponse.json({ isAuthenticated: false });
    }

    const isValid = await verifySession(token);

    return NextResponse.json({ isAuthenticated: isValid });
  } catch (error) {
    return NextResponse.json({ isAuthenticated: false });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get("session_token")?.value;

    if (token) {
      await deleteSession(token);
    }

    const response = NextResponse.json({ success: true });
    response.cookies.delete("session_token");

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
