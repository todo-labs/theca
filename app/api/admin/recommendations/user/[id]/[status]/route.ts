import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware";
import { userRecommendationsRepository } from "@/lib/db/repositories/recommendations-repository";
import { RecommendationStatus } from "@/lib/db/schema";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; status: string } }
) {
  const auth = await requireAuth(request);
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, status } = params;
  const numId = parseInt(id);

  try {
    if (status === "delete") {
      await userRecommendationsRepository.delete(numId);
    } else {
      await userRecommendationsRepository.updateStatus(numId, status as RecommendationStatus);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Failed to update user recommendation status to ${status}:`, error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(request);
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  const numId = parseInt(id);

  try {
    await userRecommendationsRepository.delete(numId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Failed to delete user recommendation:`, error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
