import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export type ReadingStatus = "want_to_read" | "currently_reading" | "completed" | "on_hold" | "did_not_finish";
export type MetadataSource = "manual" | "open_library" | "google_books";
export type GoalType = "pages_per_week" | "books_per_month" | "reading_days_per_month";
export type RecommendationStatus = "pending" | "approved" | "rejected";
export type SettingCategory = "preferences" | "display" | "notifications" | "ai" | "system";

export const books = sqliteTable("books", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  author: text("author").notNull(),
  isbn: text("isbn").unique(),
  genre: text("genre"),
  themes: text("themes", { mode: "json" }).$type<string[]>(),
  publicationYear: integer("publication_year"),
  publisher: text("publisher"),
  pageCount: integer("page_count"),
  description: text("description"),
  coverImageUrl: text("cover_image_url"),
  coverImagePath: text("cover_image_path"),
  coverImageHash: text("cover_image_hash"),
  readingStatus: text("reading_status", { enum: ["want_to_read", "currently_reading", "completed", "on_hold", "did_not_finish"] }).notNull().default("want_to_read"),
  personalRating: integer("personal_rating"),
  personalNotes: text("personal_notes"),
  dateAdded: integer("date_added", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  dateStarted: integer("date_started", { mode: "timestamp" }),
  dateFinished: integer("date_finished", { mode: "timestamp" }),
  currentPage: integer("current_page").default(0),
  isVisiblePublicly: integer("is_visible_publicly", { mode: "boolean" }).default(false),
  metadataSource: text("metadata_source", { enum: ["manual", "open_library", "google_books"] }).notNull().default("manual"),
  lastAiRefreshed: integer("last_ai_refreshed", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const readingProgress = sqliteTable("reading_progress", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  bookId: integer("book_id").notNull().references(() => books.id, { onDelete: "cascade" }),
  date: integer("date", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  pagesRead: integer("pages_read").notNull(),
  readingDurationMinutes: integer("reading_duration_minutes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

// All reading notes go here - can be page-specific or session-wide
// Link to readingProgress via application logic for context
export const journalNotes = sqliteTable("journal_notes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  bookId: integer("book_id").notNull().references(() => books.id, { onDelete: "cascade" }),
  pageNumber: integer("page_number"), // Optional - null for session-wide notes
  noteContent: text("note_content").notNull(),
  isVisiblePublicly: integer("is_visible_publicly", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const readingGoals = sqliteTable("reading_goals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  goalType: text("goal_type", { enum: ["pages_per_week", "books_per_month", "reading_days_per_month"] }).notNull(),
  targetValue: integer("target_value").notNull(),
  periodStart: integer("period_start", { mode: "timestamp" }).notNull(),
  periodEnd: integer("period_end", { mode: "timestamp" }).notNull(),
  currentProgress: integer("current_progress").default(0),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const aiRecommendations = sqliteTable("ai_recommendations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  author: text("author"),
  genre: text("genre"),
  themes: text("themes", { mode: "json" }).$type<string[]>(),
  reason: text("reason"),
  relevanceScore: integer("relevance_score"),
  basedOn: text("based_on", { mode: "json" }).$type<Array<{ bookId: number; weight?: number }>>(),
  isAccepted: integer("is_accepted", { mode: "boolean" }).default(false),
  isDeclined: integer("is_declined", { mode: "boolean" }).default(false),
  modelId: text("model_id").notNull(),
  dateGenerated: integer("date_generated", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const userRecommendations = sqliteTable("user_recommendations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  bookTitle: text("book_title").notNull(),
  author: text("author"),
  submitterNote: text("submitter_note"),
  ipAddress: text("ip_address"),
  submittedAt: integer("submitted_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  status: text("status", { enum: ["pending", "approved", "rejected"] }).notNull().default("pending"),
  aiReviewResult: text("ai_review_result", { mode: "json" }),
  aiSafetyCheckPassed: integer("ai_safety_check_passed", { mode: "boolean" }),
  aiRelevanceScore: integer("ai_relevance_score"),
  aiReasoning: text("ai_reasoning"),
  adminNotes: text("admin_notes"),
  reviewedAt: integer("reviewed_at", { mode: "timestamp" }),
  isInTrainingSet: integer("is_in_training_set", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

// Auto-generated on every reading_progress entry. Repository updates streaks:
// - Continues streak if yesterday had reading
// - Ends/starts new streak if yesterday had no reading
// - Tracks longest streak for analytics
// No cron job required - computed on demand
export const readingStreaks = sqliteTable("reading_streaks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  streakStart: integer("streak_start", { mode: "timestamp" }).notNull(),
  streakEnd: integer("streak_end", { mode: "timestamp" }).notNull(),
  consecutiveDays: integer("consecutive_days").notNull(),
  longestStreak: integer("longest_streak", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const settings = sqliteTable("settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key").notNull().unique(),
  value: text("value"),
  valueType: text("value_type", { enum: ["string", "number", "boolean", "json"] }).notNull(),
  category: text("category", { enum: ["preferences", "display", "notifications", "ai", "system"] }).notNull(),
  description: text("description"),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

// Admin authentication sessions. Tokens generated on login, validated on protected routes.
export const sessions = sqliteTable("sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  lastActive: integer("last_active", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});
