import { NextRequest, NextResponse } from "next/server";
import { userRecommendationsRepository } from "@/lib/db/repositories/recommendations";
import { settingsRepository } from "@/lib/db/repositories/settings";
import { emailService } from "@/lib/email/email-service";
import { z } from "zod";

const recommendationSchema = z.object({
  title: z.string()
    .min(1, "Book title is required")
    .max(500, "Title must be less than 500 characters")
    .trim(),
  author: z.string()
    .max(200, "Author must be less than 200 characters")
    .trim()
    .optional(),
  note: z.string()
    .max(1000, "Note must be less than 1000 characters")
    .trim()
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    const isEnabled = await settingsRepository.getBoolean(
      "recommendations_enabled",
    );

    if (!isEnabled) {
      return NextResponse.json(
        { error: "Recommendations are currently disabled" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const validationResult = recommendationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.flatten() },
        { status: 400 },
      );
    }

    const validated = validationResult.data;
    const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

    await userRecommendationsRepository.create({
      bookTitle: validated.title,
      author: validated.author || null,
      submitterNote: validated.note || null,
      ipAddress,
      submittedAt: new Date(),
    });

    // Dispatch email notification
    try {
      const emailNotificationsEnabled =
        await settingsRepository.getBoolean("emailNotifications");
      const adminEmailResult = await settingsRepository.findByKey("email");
      const adminEmail = adminEmailResult[0]?.value;

      if (emailNotificationsEnabled && adminEmail) {
        const protocol = request.headers.get("x-forwarded-proto") || "http";
        const host = request.headers.get("host");
        const adminLink = `${protocol}://${host}/admin/recommendations`;

        await emailService.sendEmail(
          adminEmail,
          "recommendation_notification",
          {
            bookTitle: validated.title,
            author: validated.author || undefined,
            submitterNote: validated.note || undefined,
            adminLink,
          },
          { host: host || undefined },
        );
      }
    } catch (emailError) {
      // Don't fail the whole request if email fails, but log it
      console.error("Failed to send notification email:", emailError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to submit recommendation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
