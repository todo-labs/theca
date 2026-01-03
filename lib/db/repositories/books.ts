import { eq, desc, and, sql, gte, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  books,
  readingProgress,
  journalNotes,
  ReadingStatus,
} from "@/lib/db/schema";

export type Book = typeof books.$inferSelect;
export type NewBook = typeof books.$inferInsert;
export type ReadingProgress = typeof readingProgress.$inferSelect;
export type NewReadingProgress = typeof readingProgress.$inferInsert;
export type JournalNote = typeof journalNotes.$inferSelect;
export type NewJournalNote = typeof journalNotes.$inferInsert;

export const bookRepository = {
  /**
   * Returns all books in the database, ordered by date added (newest first).
   */
  findAll: () => db.select().from(books).orderBy(desc(books.dateAdded)),

  /**
   * Returns a specific book by its ID.
   */
  findById: (id: number) => db.select().from(books).where(eq(books.id, id)),

  /**
   * Returns a specific book by its ISBN.
   */
  findByIsbn: (isbn: string) =>
    db.select().from(books).where(eq(books.isbn, isbn)),

  /**
   * Creates a new book in the database.
   */
  create: (data: NewBook) => db.insert(books).values(data).returning(),

  /**
   * Updates an existing book in the database.
   */
  update: (id: number, data: Partial<NewBook>) =>
    db.update(books).set(data).where(eq(books.id, id)).returning(),

  /**
   * Deletes a book from the database.
   */
  delete: (id: number) => db.delete(books).where(eq(books.id, id)).returning(),

  /**
   * Updates the reading status of a book.
   */
  updateStatus: (id: number, status: ReadingStatus) =>
    db
      .update(books)
      .set({ readingStatus: status, updatedAt: sql`now()` })
      .where(eq(books.id, id))
      .returning(),

  /**
   * Updates the current page of a book.
   */
  updateProgress: (id: number, currentPage: number) =>
    db
      .update(books)
      .set({ currentPage, updatedAt: sql`now()` })
      .where(eq(books.id, id))
      .returning(),

  /**
   * Updates the cover URL of a book.
   */
  updateCover: (id: number, coverUrl: string) =>
    db
      .update(books)
      .set({ coverImageUrl: coverUrl, updatedAt: sql`now()` })
      .where(eq(books.id, id))
      .returning(),

  /**
   * Returns all books that are visible to the public.
   */
  findVisible: () =>
    db.select().from(books).where(eq(books.isVisiblePublicly, true)),

  /**
   * Searches for books by title or author.
   */
  search: (query: string) =>
    db
      .select()
      .from(books)
      .where(
        sql`${books.title} ILIKE ${"%" + query + "%"} OR ${books.author} ILIKE ${"%" + query + "%"}`,
      ),

  /**
   * Returns all books in the wishlist, ordered by title alphabetically.
   */
  findWishlist: () =>
    db
      .select()
      .from(books)
      .where(eq(books.isWishlist, true))
      .orderBy(books.title),

  /**
   * Returns all books in the wishlist that are visible to the public.
   */
  findWishlistPublic: () =>
    db
      .select()
      .from(books)
      .where(
        and(eq(books.isWishlist, true), eq(books.isVisiblePublicly, true)),
      ),

  /**
   * Moves a book from wishlist to library.
   */
  moveToLibrary: (id: number, status: ReadingStatus = "to_read") =>
    db
      .update(books)
      .set({
        isWishlist: false,
        readingStatus: status,
        dateAcquired: sql`now()`,
        dateAddedToWishlist: sql`null`,
        updatedAt: sql`now()`,
      })
      .where(eq(books.id, id))
      .returning(),

  /**
   * Updates wishlist-specific fields for a book.
   */
  updateWishlist: (
    id: number,
    data: {
      wishlistPriority?: number;
      purchaseUrl?: string;
    },
  ) =>
    db
      .update(books)
      .set({ ...data, updatedAt: sql`now()` })
      .where(eq(books.id, id))
      .returning(),

  /**
   * Adds a book to the wishlist.
   */
  addToWishlist: (
    id: number,
    data: {
      wishlistPriority?: number;
      purchaseUrl?: string;
    },
  ) =>
    db
      .update(books)
      .set({
        isWishlist: true,
        dateAddedToWishlist: sql`now()`,
        ...data,
        updatedAt: sql`now()`,
      })
      .where(eq(books.id, id))
      .returning(),

  /**
   * Removes a book from the wishlist.
   */
  removeFromWishlist: (id: number) =>
    db
      .update(books)
      .set({
        isWishlist: false,
        wishlistPriority: sql`null`,
        purchaseUrl: sql`null`,
        dateAddedToWishlist: sql`null`,
        dateAcquired: sql`null`,
        updatedAt: sql`now()`,
      })
      .where(eq(books.id, id))
      .returning(),
};

export const readingProgressRepository = {
  /**
   * Returns all reading progress entries for a specific book, ordered by date (newest first).
   */
  findByBook: (bookId: number) =>
    db
      .select()
      .from(readingProgress)
      .where(eq(readingProgress.bookId, bookId))
      .orderBy(desc(readingProgress.date)),

  /**
   * Returns all reading progress entries for a specific book within a date range, ordered by date (newest first).
   */
  findByDateRange: (bookId: number, startDate: Date, endDate: Date) =>
    db
      .select()
      .from(readingProgress)
      .where(
        and(
          eq(readingProgress.bookId, bookId),
          gte(readingProgress.date, startDate),
          lte(readingProgress.date, endDate),
        ),
      )
      .orderBy(desc(readingProgress.date)),

  /**
   * Creates a new reading progress entry.
   */
  create: (data: NewReadingProgress) =>
    db.insert(readingProgress).values(data).returning(),

  /**
   * Returns the total pages read, total minutes, and session count for a specific book.
   */
  getTotalsByBook: (bookId: number) =>
    db
      .select({
        totalPagesRead: sql<number>`sum(${readingProgress.pagesRead})`.as(
          "totalPagesRead",
        ),
        totalMinutes:
          sql<number>`sum(${readingProgress.readingDurationMinutes})`.as(
            "totalMinutes",
          ),
        sessionsCount: sql<number>`count(*)`.as("sessionsCount"),
      })
      .from(readingProgress)
      .where(eq(readingProgress.bookId, bookId)),
};

export const journalNotesRepository = {
  /**
   * Returns all journal notes for a specific book, ordered by page number.
   */
  findByBook: (bookId: number) =>
    db
      .select()
      .from(journalNotes)
      .where(eq(journalNotes.bookId, bookId))
      .orderBy(journalNotes.pageNumber),

  /**
   * Creates a new journal note.
   */
  create: (data: NewJournalNote) =>
    db.insert(journalNotes).values(data).returning(),

  /**
   * Updates an existing journal note.
   */
  update: (id: number, data: Partial<NewJournalNote>) =>
    db
      .update(journalNotes)
      .set({ ...data, updatedAt: sql`now()` })
      .where(eq(journalNotes.id, id))
      .returning(),

  /**
   * Deletes a journal note.
   */
  delete: (id: number) =>
    db.delete(journalNotes).where(eq(journalNotes.id, id)).returning(),

  /**
   * Returns all journal notes that are visible to the public.
   */
  findVisible: () =>
    db
      .select()
      .from(journalNotes)
      .where(eq(journalNotes.isVisiblePublicly, true)),
};
