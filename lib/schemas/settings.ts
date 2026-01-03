import * as z from "zod";

export const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.email({
    message: "Please enter a valid email address.",
  }),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export const aiSettingsFormSchema = z.object({
  enableDiscovery: z.boolean(),
  refreshFrequency: z.enum(["on-demand", "daily", "weekly"]),
  maxSuggestions: z.number().min(1).max(50),
  autoApproveRecommendations: z.boolean(),
});

export type AISettingsFormValues = z.infer<typeof aiSettingsFormSchema>;

export const visibilityFormSchema = z.object({
  showProgressPublicly: z.boolean(),
  showGoalsPublicly: z.boolean(),
  defaultBookVisibility: z.enum(["public", "private"]),
  recommendations_enabled: z.boolean(),
  showWishlistPublicly: z.boolean(),
});

export type VisibilityFormValues = z.infer<typeof visibilityFormSchema>;

export const notificationFormSchema = z.object({
  emailNotifications: z.boolean(),
  frequency: z.enum(["immediate", "daily"]),
});

export type NotificationFormValues = z.infer<typeof notificationFormSchema>;

export const readingGoalsFormSchema = z.object({
  booksPerMonth: z.number().min(0),
  booksPerYear: z.number().min(0),
  pagesPerWeek: z.number().min(0),
  deadlineTracking: z.boolean(),
});

export type ReadingGoalsFormValues = z.infer<typeof readingGoalsFormSchema>;
