import { NextRequest, NextResponse } from "next/server";
import { userRecommendationsRepository } from "@/lib/db/repositories/recommendations-repository";
import { settingsRepository } from "@/lib/db/repositories/settings-repository";

export async function POST(request: NextRequest) {
  try {
    const isEnabled = await settingsRepository.getBoolean("recommendations_enabled");
    
    if (!isEnabled) {
      return NextResponse.json({ error: "Recommendations are currently disabled" }, { status: 403 });
    }

    const body = await request.json();
    const { title, author, note } = body;

    if (!title) {
      return NextResponse.json({ error: "Book title is required" }, { status: 400 });
    }

    const ipAddress = request.headers.get("x-forwarded-for") || "unknown";

    await userRecommendationsRepository.create({
      bookTitle: title,
      author: author || null,
      submitterNote: note || null,
      ipAddress,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to submit recommendation:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
