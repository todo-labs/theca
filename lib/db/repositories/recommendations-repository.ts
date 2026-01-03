import { eq, desc, sql, and } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  aiRecommendations,
  userRecommendations,
  RecommendationStatus,
} from "@/lib/db/schema";

export type AiRecommendation = typeof aiRecommendations.$inferSelect;
export type NewAiRecommendation = typeof aiRecommendations.$inferInsert;
export type UserRecommendation = typeof userRecommendations.$inferSelect;
export type NewUserRecommendation = typeof userRecommendations.$inferInsert;

export const aiRecommendationsRepository = {
  /**
   * Returns all AI recommendations, ordered by date generated (newest first).
   */
  findAll: () =>
    db
      .select()
      .from(aiRecommendations)
      .orderBy(desc(aiRecommendations.dateGenerated)),

  /**
   * Returns all AI recommendations that are pending approval.
   */
  findPending: () =>
    db
      .select()
      .from(aiRecommendations)
      .where(
        and(
          eq(aiRecommendations.isAccepted, false),
          eq(aiRecommendations.isDeclined, false),
        ),
      ),

  /**
   * Returns all AI recommendations that have been accepted.
   */
  findAccepted: () =>
    db
      .select()
      .from(aiRecommendations)
      .where(eq(aiRecommendations.isAccepted, true)),

  /**
   * Returns all AI recommendations that have been declined.
   */
  findDeclined: () =>
    db
      .select()
      .from(aiRecommendations)
      .where(eq(aiRecommendations.isDeclined, true)),

  /**
   * Creates a new AI recommendation.
   */
  create: (data: NewAiRecommendation) =>
    db.insert(aiRecommendations).values(data).returning(),

  /**
   * Accepts an AI recommendation.
   */
  accept: (id: number) =>
    db
      .update(aiRecommendations)
      .set({ isAccepted: true })
      .where(eq(aiRecommendations.id, id))
      .returning(),

  /**
   * Declines an AI recommendation.
   */
  decline: (id: number) =>
    db
      .update(aiRecommendations)
      .set({ isDeclined: true })
      .where(eq(aiRecommendations.id, id))
      .returning(),

  /**
   * Deletes an AI recommendation.
   */
  delete: (id: number) =>
    db
      .delete(aiRecommendations)
      .where(eq(aiRecommendations.id, id))
      .returning(),

  /**
   * Generates a new AI recommendation based on a list of book IDs.
   */
  generateForBooks: (bookIds: number[], modelId: string) =>
    db
      .insert(aiRecommendations)
      .values({
        title: "AI Recommendation",
        modelId,
        basedOn: bookIds.map((id) => ({ bookId: id })),
      })
      .returning(),
};

export const userRecommendationsRepository = {
  /**
   * Returns all user recommendations, ordered by submitted at (newest first).
   */
  findAll: () =>
    db
      .select()
      .from(userRecommendations)
      .orderBy(desc(userRecommendations.submittedAt)),

  /**
   * Returns all user recommendations that are pending approval.
   */
  findPending: () =>
    db
      .select()
      .from(userRecommendations)
      .where(eq(userRecommendations.status, "pending")),

  /**
   * Returns all user recommendations that have been approved.
   */
  findApproved: () =>
    db
      .select()
      .from(userRecommendations)
      .where(eq(userRecommendations.status, "approved")),

  /**
   * Returns all user recommendations that have been rejected.
   */
  findRejected: () =>
    db
      .select()
      .from(userRecommendations)
      .where(eq(userRecommendations.status, "rejected")),

  /**
   * Returns all user recommendations for a specific IP address, ordered by submitted at (newest first).
   */
  findByIp: (ipAddress: string) =>
    db
      .select()
      .from(userRecommendations)
      .where(eq(userRecommendations.ipAddress, ipAddress))
      .orderBy(desc(userRecommendations.submittedAt)),

  /**
   * Creates a new user recommendation.
   */
  create: (data: NewUserRecommendation) =>
    db.insert(userRecommendations).values(data).returning(),

  /**
   * Updates the status of a user recommendation.
   */
  updateStatus: (id: number, status: RecommendationStatus) =>
    db
      .update(userRecommendations)
      .set({ status, reviewedAt: sql`now()` })
      .where(eq(userRecommendations.id, id))
      .returning(),

  /**
   * Updates the AI review of a user recommendation.
   */
  updateAiReview: (
    id: number,
    reviewData: {
      result: any;
      safetyPassed: boolean;
      relevanceScore: number;
      reasoning: string;
    },
  ) =>
    db
      .update(userRecommendations)
      .set({
        aiReviewResult: reviewData.result,
        aiSafetyCheckPassed: reviewData.safetyPassed,
        aiRelevanceScore: reviewData.relevanceScore,
        aiReasoning: reviewData.reasoning,
      })
      .where(eq(userRecommendations.id, id))
      .returning(),

  /**
   * Adds admin notes to a user recommendation.
   */
  addAdminNotes: (id: number, notes: string) =>
    db
      .update(userRecommendations)
      .set({ adminNotes: notes })
      .where(eq(userRecommendations.id, id))
      .returning(),

  /**
   * Adds a user recommendation to the training set.
   */
  addToTrainingSet: (id: number) =>
    db
      .update(userRecommendations)
      .set({ isInTrainingSet: true })
      .where(eq(userRecommendations.id, id))
      .returning(),

  /**
   * Deletes a user recommendation.
   */
  delete: (id: number) =>
    db
      .delete(userRecommendations)
      .where(eq(userRecommendations.id, id))
      .returning(),
};
