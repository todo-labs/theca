import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminPath = pathname.startsWith("/admin");
  const isApiAuthPath = pathname.startsWith("/api/auth");

  if (isApiAuthPath) {
    return NextResponse.next();
  }

  if (isAdminPath) {
    const auth = await requireAuth(request);

    if (!auth.isAuthenticated) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
