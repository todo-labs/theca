import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware";
import { userRecommendationsRepository } from "@/lib/db/repositories/recommendations";
import { RecommendationStatus } from "@/lib/db/schema";

const VALID_STATUSES: RecommendationStatus[] = ["pending", "approved", "rejected"];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; status: string }> }
) {
  const auth = await requireAuth(request);
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, status } = await params;
  const numId = parseInt(id);

  if (isNaN(numId) || numId < 1) {
    return NextResponse.json({ error: "Invalid recommendation ID" }, { status: 400 });
  }

  try {
    if (status === "delete") {
      await userRecommendationsRepository.delete(numId);
    } else if (VALID_STATUSES.includes(status as RecommendationStatus)) {
      await userRecommendationsRepository.updateStatus(numId, status as RecommendationStatus);
    } else {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Failed to update user recommendation status to ${status}:`, error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; status: string }> }
) {
  const auth = await requireAuth(request);
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const numId = parseInt(id);

  if (isNaN(numId) || numId < 1) {
    return NextResponse.json({ error: "Invalid recommendation ID" }, { status: 400 });
  }

  try {
    await userRecommendationsRepository.delete(numId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Failed to delete user recommendation:`, error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
