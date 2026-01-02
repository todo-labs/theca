import { eq, desc, sql, and, gte, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import { readingGoals, readingStreaks, GoalType } from "@/lib/db/schema";

export type ReadingGoal = typeof readingGoals.$inferSelect;
export type NewReadingGoal = typeof readingGoals.$inferInsert;
export type ReadingStreak = typeof readingStreaks.$inferSelect;
export type NewReadingStreak = typeof readingStreaks.$inferInsert;

export const readingGoalsRepository = {
  /**
   * Returns all reading goals, ordered by creation date (newest first).
   */
  findAll: () =>
    db.select().from(readingGoals).orderBy(desc(readingGoals.createdAt)),

  /**
   * Returns all active reading goals.
   */
  findActive: () =>
    db.select().from(readingGoals).where(eq(readingGoals.isActive, true)),

  /**
   * Returns all reading goals of a specific type, ordered by creation date (newest first).
   */
  findByType: (goalType: GoalType) =>
    db
      .select()
      .from(readingGoals)
      .where(eq(readingGoals.goalType, goalType))
      .orderBy(desc(readingGoals.createdAt)),

  /**
   * Creates a new reading goal.
   */
  create: (data: NewReadingGoal) =>
    db.insert(readingGoals).values(data).returning(),

  /**
   * Updates an existing reading goal.
   */
  update: (id: number, data: Partial<NewReadingGoal>) =>
    db
      .update(readingGoals)
      .set({ ...data, updatedAt: sql`EXTRACT(EPOCH FROM NOW())::INTEGER` })
      .where(eq(readingGoals.id, id))
      .returning(),

  /**
   * Updates the progress of a reading goal.
   */
  updateProgress: (id: number, currentProgress: number) =>
    db
      .update(readingGoals)
      .set({ currentProgress, updatedAt: sql`EXTRACT(EPOCH FROM NOW())::INTEGER` })
      .where(eq(readingGoals.id, id))
      .returning(),

  /**
   * Deactivates a reading goal.
   */
  deactivate: (id: number) =>
    db
      .update(readingGoals)
      .set({ isActive: false, updatedAt: sql`EXTRACT(EPOCH FROM NOW())::INTEGER` })
      .where(eq(readingGoals.id, id))
      .returning(),

  /**
   * Returns the current reading period for active reading goals.
   */
  findCurrentPeriod: () =>
    db
      .select()
      .from(readingGoals)
      .where(
        and(
          eq(readingGoals.isActive, true),
          sql`CURRENT_DATE BETWEEN ${readingGoals.periodStart} AND ${readingGoals.periodEnd}`,
        ),
      ),
};

export const readingStreaksRepository = {
  /**
   * Returns all reading streaks, ordered by consecutive days (newest first).
   */
  findAll: () =>
    db
      .select()
      .from(readingStreaks)
      .orderBy(desc(readingStreaks.consecutiveDays)),

  /**
   * Creates a new reading streak.
   */
  create: (data: NewReadingStreak) =>
    db.insert(readingStreaks).values(data).returning(),

  /**
   * Returns the current reading streak.
   */
  findCurrentStreak: () =>
    db
      .select()
      .from(readingStreaks)
      .where(
        sql`CURRENT_DATE BETWEEN ${readingStreaks.streakStart} AND ${readingStreaks.streakEnd}`,
      )
      .orderBy(desc(readingStreaks.consecutiveDays))
      .limit(1),

  /**
   * Returns the longest reading streak.
   */
  findLongestStreak: () =>
    db
      .select()
      .from(readingStreaks)
      .where(eq(readingStreaks.longestStreak, true))
      .orderBy(desc(readingStreaks.consecutiveDays)),

  /**
   * Updates a reading streak.
   */
  updateStreak: (
    streakStart: Date,
    streakEnd: Date,
    consecutiveDays: number,
    isLongest = false,
  ) =>
    db
      .insert(readingStreaks)
      .values({
        streakStart,
        streakEnd,
        consecutiveDays,
        longestStreak: isLongest,
      })
      .returning(),

  /**
   * Marks a reading streak as the longest streak.
   */
  markLongestStreak: (id: number) =>
    db
      .update(readingStreaks)
      .set({ longestStreak: true })
      .where(eq(readingStreaks.id, id))
      .returning(),
};
