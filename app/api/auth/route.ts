import { NextRequest, NextResponse } from "next/server";
import { verifyTOTP, createJWT, verifyJWT } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const isValid = verifyTOTP(token);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const sessionToken = await createJWT();

    const sessionTimeoutHours = parseInt(
      process.env.SESSION_TIMEOUT_HOURS || "24",
    );
    const response = NextResponse.json({ success: true });
    response.cookies.set("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: sessionTimeoutHours * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("session_token")?.value;

    if (!token) {
      return NextResponse.json({ isAuthenticated: false });
    }

    const isValid = await verifyJWT(token);

    return NextResponse.json({ isAuthenticated: isValid });
  } catch (error) {
    return NextResponse.json({ isAuthenticated: false });
  }
}

export async function DELETE(_request: NextRequest) {
  try {
    const response = NextResponse.json({ success: true });
    response.cookies.delete("session_token");

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
