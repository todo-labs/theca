import { NextRequest, NextResponse } from "next/server";
import { userRecommendationsRepository } from "@/lib/db/repositories/recommendations-repository";
import { settingsRepository } from "@/lib/db/repositories/settings-repository";
import { emailService } from "@/lib/email/email-service";

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

    // Dispatch email notification
    try {
      const emailNotificationsEnabled = await settingsRepository.getBoolean("emailNotifications");
      const adminEmailResult = await settingsRepository.findByKey("email");
      const adminEmail = adminEmailResult[0]?.value;

      if (emailNotificationsEnabled && adminEmail) {
        const protocol = request.headers.get("x-forwarded-proto") || "http";
        const host = request.headers.get("host");
        const adminLink = `${protocol}://${host}/admin/recommendations`;

        await emailService.sendEmail(adminEmail, "recommendation_notification", {
          bookTitle: title,
          author: author || undefined,
          submitterNote: note || undefined,
          adminLink,
        }, { host: host || undefined });
      }
    } catch (emailError) {
      // Don't fail the whole request if email fails, but log it
      console.error("Failed to send notification email:", emailError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to submit recommendation:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
