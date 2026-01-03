import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { books } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { BookProgressSchema } from "@/lib/domain";
import { requireAuth } from "@/lib/middleware";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(request);
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const validated = BookProgressSchema.parse(body);

    const bookId = parseInt(id);
    if (isNaN(bookId)) {
      return NextResponse.json({ error: "Invalid book ID" }, { status: 400 });
    }

    const book = await db.query.books.findFirst({
      where: eq(books.id, bookId),
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (validated.currentPage !== undefined) {
      updateData.currentPage = validated.currentPage;
    }
    if (validated.readingStatus !== undefined) {
      updateData.readingStatus = validated.readingStatus;
    }

    const [updatedBook] = await db
      .update(books)
      .set(updateData)
      .where(eq(books.id, bookId))
      .returning();

    if (!updatedBook) {
      return NextResponse.json(
        { error: "Failed to update book" },
        { status: 500 },
      );
    }

    return NextResponse.json(updatedBook);
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "name" in error &&
      error.name === "ZodError"
    ) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 },
      );
    }
    console.error("Error updating book progress:", error);
    return NextResponse.json(
      { error: "Failed to update book progress" },
      { status: 500 },
    );
  }
}
