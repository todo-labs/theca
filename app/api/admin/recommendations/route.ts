import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware";
import { aiRecommendationsRepository, userRecommendationsRepository } from "@/lib/db/repositories/recommendations-repository";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [aiRecs, userRecs] = await Promise.all([
      aiRecommendationsRepository.findAll(),
      userRecommendationsRepository.findAll(),
    ]);

    return NextResponse.json({
      ai: aiRecs,
      user: userRecs,
    });
  } catch (error) {
    console.error("Failed to fetch recommendations:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
