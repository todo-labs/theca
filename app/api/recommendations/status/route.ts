import { NextRequest, NextResponse } from "next/server";
import { settingsRepository } from "@/lib/db/repositories/settings-repository";

export async function GET() {
  try {
    const isEnabled = await settingsRepository.getBoolean("recommendations_enabled");
    return NextResponse.json({ enabled: isEnabled });
  } catch (error) {
    console.error("Failed to fetch recommendation status:", error);
    return NextResponse.json({ enabled: false });
  }
}
