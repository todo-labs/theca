import { eq, desc, and, sql, gte, lte } from "drizzle-orm";
import { db } from "./index";
import { books, readingProgress, journalNotes } from "./schema";

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
  findByIsbn: (isbn: string) => db.select().from(books).where(eq(books.isbn, isbn)),

  /**
   * Creates a new book in the database.
   */
  create: (data: NewBook) => db.insert(books).values(data).returning(),

  /**
   * Updates an existing book in the database.
   */
  update: (id: number, data: Partial<NewBook>) =>
    db.update(books).set({ ...data, updatedAt: sql`unixepoch()` }).where(eq(books.id, id)).returning(),

  /**
   * Deletes a book from the database.
   */
  delete: (id: number) => db.delete(books).where(eq(books.id, id)).returning(),

  /**
   * Updates the reading status of a book.
   */
  updateStatus: (id: number, status: string) =>
    db.update(books).set({ readingStatus: status, updatedAt: sql`unixepoch()` }).where(eq(books.id, id)).returning(),

  /**
   * Updates the current page of a book.
   */
  updateProgress: (id: number, currentPage: number) =>
    db.update(books).set({ currentPage, updatedAt: sql`unixepoch()` }).where(eq(books.id, id)).returning(),

  /**
   * Updates the cover of a book.
   */
  updateCover: (id: number, coverData: { url?: string; path?: string; hash?: string }) =>
    db.update(books).set(coverData).where(eq(books.id, id)).returning(),

    /**
   * Returns all books that are visible to the public.
   */
  findVisible: () => db.select().from(books).where(eq(books.isVisiblePublicly, true)),

  /**
   * Searches for books by title or author.
   */
  search: (query: string) =>
    db
      .select()
      .from(books)
      .where(sql`${books.title} LIKE ${"%" + query + "%"} OR ${books.author} LIKE ${"%" + query + "%"}`),
};

export const readingProgressRepository = {
  /**
   * Returns all reading progress entries for a specific book, ordered by date (newest first).
   */
  findByBook: (bookId: number) =>
    db.select().from(readingProgress).where(eq(readingProgress.bookId, bookId)).orderBy(desc(readingProgress.date)),

  /**
   * Returns all reading progress entries for a specific book within a date range, ordered by date (newest first).
   */
  findByDateRange: (bookId: number, startDate: Date, endDate: Date) =>
    db
      .select()
      .from(readingProgress)
      .where(and(eq(readingProgress.bookId, bookId), gte(readingProgress.date, startDate), lte(readingProgress.date, endDate)))
      .orderBy(desc(readingProgress.date)),

  /**
   * Creates a new reading progress entry.
   */
  create: (data: NewReadingProgress) => db.insert(readingProgress).values(data).returning(),

  /**
   * Returns the total pages read, total minutes, and session count for a specific book.
   */
  getTotalsByBook: (bookId: number) =>
    db
      .select({
        totalPagesRead: sql<number>`sum(${readingProgress.pagesRead})`.as("totalPagesRead"),
        totalMinutes: sql<number>`sum(${readingProgress.readingDurationMinutes})`.as("totalMinutes"),
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
    db.select().from(journalNotes).where(eq(journalNotes.bookId, bookId)).orderBy(journalNotes.pageNumber),

  /**
   * Creates a new journal note.
   */
  create: (data: NewJournalNote) => db.insert(journalNotes).values(data).returning(),

  /**
   * Updates an existing journal note.
   */
  update: (id: number, data: Partial<NewJournalNote>) =>
    db.update(journalNotes).set({ ...data, updatedAt: sql`unixepoch()` }).where(eq(journalNotes.id, id)).returning(),

  /**
   * Deletes a journal note.
   */
  delete: (id: number) => db.delete(journalNotes).where(eq(journalNotes.id, id)).returning(),

  /**
   * Returns all journal notes that are visible to the public.
   */
  findVisible: () => db.select().from(journalNotes).where(eq(journalNotes.isVisiblePublicly, true)),
};
