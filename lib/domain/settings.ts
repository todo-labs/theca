import { z } from "zod";

export const NotificationFrequencySchema = z.enum([
  "immediate",
  "daily",
  "weekly",
  "never",
]);
export const VisibilitySchema = z.enum(["public", "private"]);

export const SettingsUpdateSchema = z.object({
  allowRecommendations: z.boolean().optional(),
  isVisiblePublicly: z.boolean().optional(),
  notificationFrequency: NotificationFrequencySchema.optional(),
  notificationEmail: z.string().email().optional().or(z.literal("")),
});

export const ReadingGoalUpdateSchema = z.object({
  yearlyGoal: z.number().int().min(0).optional(),
  goalType: z.enum(["books", "pages"]).optional(),
});

export type NotificationFrequency = z.infer<typeof NotificationFrequencySchema>;
export type Visibility = z.infer<typeof VisibilitySchema>;
export type SettingsUpdate = z.infer<typeof SettingsUpdateSchema>;
export type ReadingGoalUpdate = z.infer<typeof ReadingGoalUpdateSchema>;
