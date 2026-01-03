import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware";
import { aiRecommendationsRepository } from "@/lib/db/repositories/recommendations";

type RouteContext = {
  params: Promise<{ id: string; action: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const auth = await requireAuth(request);
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, action } = await context.params;
  const numId = parseInt(id);

  try {
    if (action === "accept") {
      await aiRecommendationsRepository.accept(numId);
    } else if (action === "decline") {
      await aiRecommendationsRepository.decline(numId);
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Failed to ${action} AI recommendation:`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
