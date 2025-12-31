import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware";
import { settingsRepository } from "@/lib/db/repositories/settings-repository";
import { 
  profileFormSchema, 
  aiSettingsFormSchema, 
  visibilityFormSchema, 
  notificationFormSchema, 
  readingGoalsFormSchema 
} from "@/lib/schemas/settings";
import { SettingCategory } from "@/lib/db/schema";

const SCHEMA_MAP: Record<string, any> = {
  profile: profileFormSchema,
  ai: aiSettingsFormSchema,
  visibility: visibilityFormSchema,
  notifications: notificationFormSchema,
  goals: readingGoalsFormSchema,
};

const CATEGORY_MAP: Record<string, SettingCategory> = {
  profile: "system",
  ai: "ai",
  visibility: "preferences",
  notifications: "notifications",
  goals: "preferences",
};

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const allSettings = await settingsRepository.findAll();
    const settingsMap = allSettings.reduce((acc, curr) => {
      let value: any = curr.value;
      if (curr.valueType === "json" && curr.value) {
        value = JSON.parse(curr.value);
      } else if (curr.valueType === "number") {
        value = Number(curr.value);
      } else if (curr.valueType === "boolean") {
        value = curr.value === "true";
      }
      acc[curr.key] = value;
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json(settingsMap);
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { category, data } = body;

    if (!category || !data) {
      return NextResponse.json({ error: "Missing category or data" }, { status: 400 });
    }

    const schema = SCHEMA_MAP[category];
    const dbCategory = CATEGORY_MAP[category];

    if (!schema || !dbCategory) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    const validatedData = schema.parse(data);

    // Save each field
    for (const [key, value] of Object.entries(validatedData)) {
      let valueStr = String(value);
      let valueType: "string" | "number" | "boolean" | "json" = "string";

      if (typeof value === "number") {
        valueType = "number";
      } else if (typeof value === "boolean") {
        valueType = "boolean";
        valueStr = value ? "true" : "false";
      } else if (typeof value === "object") {
        valueType = "json";
        valueStr = JSON.stringify(value);
      }

      await settingsRepository.set(key, valueStr, dbCategory, valueType);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    console.error("Failed to update settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
