import { eq, desc, sql, and, gte, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import { settings, sessions, SettingCategory } from "@/lib/db/schema";

export type Setting = typeof settings.$inferSelect;
export type NewSetting = typeof settings.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export const settingsRepository = {
  /**
   * Returns all settings, ordered by key.
   */
  findAll: () => db.select().from(settings).orderBy(settings.key),

  /**
   * Returns a specific setting by key.
   */
  findByKey: (key: string) =>
    db.select().from(settings).where(eq(settings.key, key)),

  /**
   * Returns a specific setting by key.
   */
  get: (key: string) => db.select().from(settings).where(eq(settings.key, key)),

  /**
   * Returns settings by category.
   */
  findByCategory: (category: SettingCategory) =>
    db.select().from(settings).where(eq(settings.category, category)),

  /**
   * Sets a specific setting by key.
   */
  set: (
    key: string,
    value: string,
    category: SettingCategory = "preferences",
    valueType: "string" | "number" | "boolean" | "json" = "string",
    description?: string,
  ) =>
    db
      .insert(settings)
      .values({ key, value, category, valueType, description })
      .onConflictDoUpdate({
        target: settings.key,
        set: {
          value,
          category,
          valueType,
          description,
          updatedAt: sql`now()`,
        },
      })
      .returning(),

  /**
   * Deletes a specific setting by key.
   */
  delete: (key: string) =>
    db.delete(settings).where(eq(settings.key, key)).returning(),

  /**
   * Gets a boolean value for a specific setting by key.
   */
  getBoolean: async (key: string): Promise<boolean> => {
    const result = await db
      .select()
      .from(settings)
      .where(eq(settings.key, key))
      .limit(1);
    return result[0]?.value === "true";
  },

  /**
   * Gets a number value for a specific setting by key.
   */
  getNumber: async (key: string): Promise<number> => {
    const result = await db
      .select()
      .from(settings)
      .where(eq(settings.key, key))
      .limit(1);
    return parseInt(result[0]?.value || "0", 10);
  },

  /**
   * Gets a JSON value for a specific setting by key.
   */
  getJson: async (key: string): Promise<any> => {
    const result = await db
      .select()
      .from(settings)
      .where(eq(settings.key, key))
      .limit(1);
    return result[0]?.value ? JSON.parse(result[0].value) : null;
  },
};

export const sessionsRepository = {
  /**
   * Returns all sessions, ordered by created at (newest first).
   */
  findAll: () => db.select().from(sessions).orderBy(desc(sessions.createdAt)),

  /**
   * Returns a specific session by token.
   */
  findByToken: (token: string) =>
    db.select().from(sessions).where(eq(sessions.token, token)).limit(1),

  /**
   * Creates a new session.
   */
  create: (token: string, expiresAt: Date) =>
    db.insert(sessions).values({ token, expiresAt }).returning(),

  /**
   * Validates a session by token.
   */
  validate: (token: string) =>
    db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.token, token),
          gte(sessions.expiresAt, sql`now()`),
        ),
      )
      .limit(1),

  /**
   * Updates the last active time for a specific session by token.
   */
  updateLastActive: (token: string) =>
    db
      .update(sessions)
      .set({ lastActive: sql`now()` })
      .where(eq(sessions.token, token))
      .returning(),

  /**
   * Deletes a specific session by token.
   */
  delete: (token: string) =>
    db.delete(sessions).where(eq(sessions.token, token)).returning(),

  /**
   * Deletes all expired sessions.
   */
  deleteExpired: () =>
    db
      .delete(sessions)
      .where(lte(sessions.expiresAt, sql`now()`))
      .returning(),

  /**
   * Deletes all sessions.
   */
  deleteAll: () => db.delete(sessions).returning(),
};
