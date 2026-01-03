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
        DATE_TRUNC('day', rp.date) as date,
        SUM(rp.pages_read)::INTEGER as "pagesRead",
        ARRAY_AGG(b.title) FILTER (WHERE b.title IS NOT NULL) as books
      FROM reading_progress rp
      LEFT JOIN books b ON rp.book_id = b.id
      WHERE rp.date >= NOW() - INTERVAL '365 days'
      GROUP BY DATE_TRUNC('day', rp.date)
      ORDER BY date ASC
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
  },

  // Reports-specific analytics
  getBooksByStatus: async () => {
    const result = await db
      .select({
        status: books.readingStatus,
        count: count(),
      })
      .from(books)
      .groupBy(books.readingStatus);
    
    return result.map(row => ({
      status: row.status || 'unknown',
      count: Number(row.count),
    }));
  },

  getReadingVelocity: async () => {
    // Pages read per day for the last 30 days
    const result = (await db.execute(sql`
      SELECT 
        DATE_TRUNC('day', date) as date,
        SUM(pages_read)::INTEGER as pages
      FROM reading_progress
      WHERE date >= NOW() - INTERVAL '30 days'
      GROUP BY DATE_TRUNC('day', date)
      ORDER BY date ASC
    `)) as any[];
    
    return result.map(row => ({
      date: new Date(row.date as string),
      pages: Number(row.pages || 0),
    }));
  },

  getWeeklyComparison: async () => {
    // Compare this week vs last week
    const result = (await db.execute(sql`
      WITH current_week AS (
        SELECT COALESCE(SUM(pages_read), 0)::INTEGER as pages
        FROM reading_progress
        WHERE date >= DATE_TRUNC('week', NOW())
      ),
      last_week AS (
        SELECT COALESCE(SUM(pages_read), 0)::INTEGER as pages
        FROM reading_progress
        WHERE date >= DATE_TRUNC('week', NOW() - INTERVAL '1 week')
          AND date < DATE_TRUNC('week', NOW())
      )
      SELECT 
        (SELECT pages FROM current_week) as current_pages,
        (SELECT pages FROM last_week) as last_pages
    `)) as any[];
    
    const data = result[0] || { current_pages: 0, last_pages: 0 };
    const currentPages = Number(data.current_pages || 0);
    const lastPages = Number(data.last_pages || 0);
    const change = lastPages === 0 ? 0 : Math.round(((currentPages - lastPages) / lastPages) * 100);
    
    return {
      currentWeekPages: currentPages,
      lastWeekPages: lastPages,
      percentChange: change,
    };
  },

  getInsights: async () => {
    // Calculate various insights
    const [totalBooksResult] = await db.select({ count: count() }).from(books);
    const [completedBooksResult] = await db
      .select({ count: count() })
      .from(books)
      .where(eq(books.readingStatus, "completed"));
    
    // Average pages per reading session
    const [avgPagesResult] = (await db.execute(sql`
      SELECT COALESCE(AVG(pages_read), 0)::INTEGER as avg_pages
      FROM reading_progress
    `)) as any[];
    
    // Most read genre
    const topGenreResult = (await db.execute(sql`
      SELECT genre, COUNT(*)::INTEGER as count
      FROM books
      WHERE genre IS NOT NULL
      GROUP BY genre
      ORDER BY count DESC
      LIMIT 1
    `)) as any[];
    
    // Reading streak (consecutive days with reading activity)
    const streakResult = (await db.execute(sql`
      WITH daily_reads AS (
        SELECT DISTINCT DATE_TRUNC('day', date)::DATE as read_date
        FROM reading_progress
        WHERE date >= NOW() - INTERVAL '365 days'
        ORDER BY read_date DESC
      ),
      streak_calc AS (
        SELECT 
          read_date,
          read_date - (ROW_NUMBER() OVER (ORDER BY read_date DESC))::INTEGER as grp
        FROM daily_reads
      )
      SELECT COUNT(*)::INTEGER as streak
      FROM streak_calc
      WHERE grp = (SELECT grp FROM streak_calc WHERE read_date = CURRENT_DATE LIMIT 1)
    `)) as any[];
    
    return {
      totalBooks: Number(totalBooksResult.count),
      completedBooks: Number(completedBooksResult.count),
      completionRate: totalBooksResult.count > 0 
        ? Math.round((Number(completedBooksResult.count) / Number(totalBooksResult.count)) * 100) 
        : 0,
      avgPagesPerSession: Number(avgPagesResult?.avg_pages || 0),
      topGenre: topGenreResult[0]?.genre || 'N/A',
      currentStreak: Number(streakResult[0]?.streak || 0),
    };
  },
};
