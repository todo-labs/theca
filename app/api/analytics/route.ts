import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware";
import { analyticsRepository } from "@/lib/db/repositories/analytics-repository";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [stats, genres, monthly, goals, activity] = await Promise.all([
      analyticsRepository.getDashboardStats(),
      analyticsRepository.getGenreDistribution(),
      analyticsRepository.getMonthlyActivity(),
      analyticsRepository.getReadingGoalsStatus(),
      analyticsRepository.getActivity(),
    ]);

    return NextResponse.json({
      stats,
      genres,
      monthly,
      goals,
      activity,
    });
  } catch (error) {
    console.error("Failed to fetch analytics:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
