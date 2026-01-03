import { z } from "zod";

export const ReadingStatusSchema = z.enum([
  "to_read",
  "in_progress",
  "read",
  "paused",
  "dnf",
]);
export const MetadataSourceSchema = z.enum(["manual", "ai_extracted", "both"]);
export const RecommendationStatusSchema = z.enum([
  "pending",
  "approved",
  "rejected",
]);
export const RecommendationActionSchema = z.enum(["accept", "decline"]);

export type ReadingStatus = z.infer<typeof ReadingStatusSchema>;
export type MetadataSource = z.infer<typeof MetadataSourceSchema>;
export type RecommendationStatus = z.infer<typeof RecommendationStatusSchema>;
export type RecommendationAction = z.infer<typeof RecommendationActionSchema>;

export const BookSchema = z.object({
  id: z.number(),
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().nullable().optional(),
  author: z.string().min(1, "Author is required"),
  isbn: z.string().nullable().optional(),
  genre: z.string().nullable().optional(),
  themes: z.array(z.string()).default([]),
  publicationYear: z.number().int().nullable().optional(),
  publisher: z.string().nullable().optional(),
  pageCount: z.number().int().positive().nullable().optional(),
  description: z.string().nullable().optional(),
  coverImageUrl: z.string().url().nullable().optional(),
  readingStatus: ReadingStatusSchema,
  personalRating: z.number().int().min(1).max(5).nullable().optional(),
  personalNotes: z.string().nullable().optional(),
  dateAdded: z.string().optional(),
  dateStarted: z.string().nullable().optional(),
  dateFinished: z.string().nullable().optional(),
  currentPage: z.number().int().min(0).default(0),
  isVisiblePublicly: z.boolean().default(false),
  metadataSource: MetadataSourceSchema,
  lastAiRefreshed: z.string().nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  isWishlist: z.boolean().default(false),
  wishlistPriority: z.number().int().min(1).max(5).nullable().optional(),
  purchaseUrl: z.string().url().nullable().optional(),
  dateAddedToWishlist: z.string().nullable().optional(),
  dateAcquired: z.string().nullable().optional(),
});

export type Book = z.infer<typeof BookSchema>;

export const BookCreateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  isbn: z.string().optional(),
  coverImageUrl: z.string().url().optional(),
  pageCount: z.number().int().positive().optional(),
  genre: z.string().optional(),
  publisher: z.string().optional(),
  publicationYear: z.number().int().optional(),
  readingStatus: ReadingStatusSchema.default("to_read"),
  personalRating: z.number().int().min(1).max(5).optional(),
  personalNotes: z.string().optional(),
  currentPage: z.number().int().min(0).default(0),
  isVisiblePublicly: z.boolean().default(false),
  metadataSource: MetadataSourceSchema.default("manual"),
});

export const BookUpdateSchema = BookCreateSchema.partial().extend({
  id: z.string(),
  readingStatus: ReadingStatusSchema.optional(),
  currentPage: z.number().int().min(0).optional(),
  isVisiblePublicly: z.boolean().optional(),
  notes: z.string().optional(),
});

export const BookProgressSchema = z
  .object({
    currentPage: z.number().int().min(0).optional(),
    readingStatus: ReadingStatusSchema.optional(),
  })
  .refine(
    (data) =>
      data.currentPage !== undefined || data.readingStatus !== undefined,
    {
      message:
        "At least one field (currentPage or readingStatus) must be provided",
    },
  );

export const RecommendationCreateSchema = z.object({
  userId: z.string(),
  bookId: z.string(),
  reason: z.string().min(1, "Recommendation reason is required"),
});

export type BookCreate = z.infer<typeof BookCreateSchema>;
export type BookUpdate = z.infer<typeof BookUpdateSchema>;
export type BookProgress = z.infer<typeof BookProgressSchema>;
export type RecommendationCreate = z.infer<typeof RecommendationCreateSchema>;
