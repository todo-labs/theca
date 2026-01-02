import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  jsonb,
  serial,
} from "drizzle-orm/pg-core";

export type ReadingStatus =
  | "want_to_read"
  | "currently_reading"
  | "completed"
  | "on_hold"
  | "did_not_finish";
export type MetadataSource = "manual" | "open_library" | "google_books";
export type GoalType =
  | "pages_per_week"
  | "books_per_month"
  | "reading_days_per_month";
export type RecommendationStatus = "pending" | "approved" | "rejected";
export type SettingCategory =
  | "preferences"
  | "display"
  | "notifications"
  | "ai"
  | "system";

export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  author: text("author").notNull(),
  isbn: text("isbn").unique(),
  genre: text("genre"),
  themes: jsonb("themes").$type<string[]>(),
  publicationYear: integer("publication_year"),
  publisher: text("publisher"),
  pageCount: integer("page_count"),
  description: text("description"),
  coverImageUrl: text("cover_image_url"),
  coverImagePath: text("cover_image_path"),
  coverImageHash: text("cover_image_hash"),
  readingStatus: text("reading_status", {
    enum: [
      "want_to_read",
      "currently_reading",
      "completed",
      "on_hold",
      "did_not_finish",
    ],
  })
    .notNull()
    .default("want_to_read"),
  personalRating: integer("personal_rating"),
  personalNotes: text("personal_notes"),
  dateAdded: timestamp("date_added").notNull().defaultNow(),
  dateStarted: timestamp("date_started"),
  dateFinished: timestamp("date_finished"),
  currentPage: integer("current_page").default(0),
  isVisiblePublicly: boolean("is_visible_publicly").default(false),
  metadataSource: text("metadata_source", {
    enum: ["manual", "open_library", "google_books"],
  })
    .notNull()
    .default("manual"),
  lastAiRefreshed: timestamp("last_ai_refreshed"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const readingProgress = pgTable("reading_progress", {
  id: serial("id").primaryKey(),
  bookId: integer("book_id")
    .notNull()
    .references(() => books.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull().defaultNow(),
  pagesRead: integer("pages_read").notNull(),
  readingDurationMinutes: integer("reading_duration_minutes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// All reading notes go here - can be page-specific or session-wide
// Link to readingProgress via application logic for context
export const journalNotes = pgTable("journal_notes", {
  id: serial("id").primaryKey(),
  bookId: integer("book_id")
    .notNull()
    .references(() => books.id, { onDelete: "cascade" }),
  pageNumber: integer("page_number"), // Optional - null for session-wide notes
  noteContent: text("note_content").notNull(),
  isVisiblePublicly: boolean("is_visible_publicly").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const readingGoals = pgTable("reading_goals", {
  id: serial("id").primaryKey(),
  goalType: text("goal_type", {
    enum: ["pages_per_week", "books_per_month", "reading_days_per_month"],
  }).notNull(),
  targetValue: integer("target_value").notNull(),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  currentProgress: integer("current_progress").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const aiRecommendations = pgTable("ai_recommendations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author"),
  genre: text("genre"),
  themes: jsonb("themes").$type<string[]>(),
  reason: text("reason"),
  relevanceScore: integer("relevance_score"),
  basedOn:
    jsonb("based_on").$type<Array<{ bookId: number; weight?: number }>>(),
  isAccepted: boolean("is_accepted").default(false),
  isDeclined: boolean("is_declined").default(false),
  modelId: text("model_id").notNull(),
  dateGenerated: timestamp("date_generated").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const userRecommendations = pgTable("user_recommendations", {
  id: serial("id").primaryKey(),
  bookTitle: text("book_title").notNull(),
  author: text("author"),
  submitterNote: text("submitter_note"),
  ipAddress: text("ip_address"),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  status: text("status", { enum: ["pending", "approved", "rejected"] })
    .notNull()
    .default("pending"),
  aiReviewResult: jsonb("ai_review_result"),
  aiSafetyCheckPassed: boolean("ai_safety_check_passed"),
  aiRelevanceScore: integer("ai_relevance_score"),
  aiReasoning: text("ai_reasoning"),
  adminNotes: text("admin_notes"),
  reviewedAt: timestamp("reviewed_at"),
  isInTrainingSet: boolean("is_in_training_set").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Auto-generated on every reading_progress entry. Repository updates streaks:
// - Continues streak if yesterday had reading
// - Ends/starts new streak if yesterday had no reading
// - Tracks longest streak for analytics
// No cron job required - computed on demand
export const readingStreaks = pgTable("reading_streaks", {
  id: serial("id").primaryKey(),
  streakStart: timestamp("streak_start").notNull(),
  streakEnd: timestamp("streak_end").notNull(),
  consecutiveDays: integer("consecutive_days").notNull(),
  longestStreak: boolean("longest_streak").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value"),
  valueType: text("value_type", {
    enum: ["string", "number", "boolean", "json"],
  }).notNull(),
  category: text("category", {
    enum: ["preferences", "display", "notifications", "ai", "system"],
  }).notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Admin authentication sessions. Tokens generated on login, validated on protected routes.
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
  lastActive: timestamp("last_active").notNull().defaultNow(),
});
