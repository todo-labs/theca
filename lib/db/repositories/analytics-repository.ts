import { sql, eq, count, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { books, readingProgress, readingGoals } from "@/lib/db/schema";

export const analyticsRepository = {
  getDashboardStats: async () => {
    const [totalBooks] = await db.select({ count: count() }).from(books);
    const [currentlyReading] = await db
      .select({ count: count() })
      .from(books)
      .where(eq(books.readingStatus, "currently_reading"));
    
    // Simple streak calculation (placeholder or actual query if streak table used)
    // For now returning mock/placeholder based on reading progress
    const [pagesRead] = await db
      .select({ sum: sql<number>`COALESCE(SUM(${readingProgress.pagesRead}), 0)` })
      .from(readingProgress);

    return {
      totalBooks: Number(totalBooks.count),
      currentlyReading: Number(currentlyReading.count),
      totalPagesRead: Number(pagesRead.sum),
    };
  },

  getGenreDistribution: async () => {
    return await db
      .select({
        genre: books.genre,
        count: count(),
      })
      .from(books)
      .groupBy(books.genre)
      .where(sql`${books.genre} IS NOT NULL`);
  },

  getMonthlyActivity: async () => {
    // Last 6 months activity
    const result = (await db.execute(sql`
      SELECT 
        TO_CHAR(DATE_TRUNC('month', date), 'Mon') as month,
        SUM(pages_read)::INTEGER as pages
      FROM reading_progress
      WHERE date >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', date), TO_CHAR(DATE_TRUNC('month', date), 'Mon')
      ORDER BY DATE_TRUNC('month', date)
    `)) as any[];
    return result;
  },

  getActivity: async () => {
    // Last 365 days of activity
    const result = (await db.execute(sql`
      SELECT 
        rp.date,
        SUM(rp.pages_read)::INTEGER as "pagesRead",
        ARRAY_AGG(b.title) FILTER (WHERE b.title IS NOT NULL) as books
      FROM reading_progress rp
      LEFT JOIN books b ON rp.book_id = b.id
      WHERE rp.date >= NOW() - INTERVAL '365 days'
      GROUP BY rp.date
      ORDER BY rp.date ASC
    `)) as any[];
    return result.map(row => ({
      ...row,
      date: new Date(row.date as string),
      books: row.books || []
    }));
  },

  getReadingGoalsStatus: async () => {
    return await db
      .select()
      .from(readingGoals)
      .where(eq(readingGoals.isActive, true));
  }
};
