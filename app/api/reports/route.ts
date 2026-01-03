import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware";
import { analyticsRepository } from "@/lib/db/repositories/analytics";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [
      genres,
      booksByStatus,
      readingVelocity,
      weeklyComparison,
      insights,
      monthly,
    ] = await Promise.all([
      analyticsRepository.getGenreDistribution(),
      analyticsRepository.getBooksByStatus(),
      analyticsRepository.getReadingVelocity(),
      analyticsRepository.getWeeklyComparison(),
      analyticsRepository.getInsights(),
      analyticsRepository.getMonthlyActivity(),
    ]);

    return NextResponse.json({
      genres,
      booksByStatus,
      readingVelocity,
      weeklyComparison,
      insights,
      monthly,
    });
  } catch (error) {
    console.error("Failed to fetch reports data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
