import { NextRequest, NextResponse } from "next/server";
import { bookRepository } from "@/lib/db/repositories/books";
import { ReadingStatus } from "@/lib/db/schema";
import { requireAuth } from "@/lib/middleware";
import { z } from "zod";

const acquireSchema = z.object({
  status: z.enum(["to_read", "in_progress", "read", "paused", "dnf"]).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(request);
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const bookId = parseInt(id);

    if (isNaN(bookId) || bookId < 1) {
      return NextResponse.json({ error: "Invalid book ID" }, { status: 400 });
    }

    const body = await request.json();
    const validationResult = acquireSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.flatten() },
        { status: 400 },
      );
    }

    const validated = validationResult.data;
    const status: ReadingStatus = validated.status || "to_read";

    const result = await bookRepository.moveToLibrary(bookId, status);
    const updatedBook = result[0];

    if (!updatedBook) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    return NextResponse.json(updatedBook);
  } catch (error) {
    console.error("Error acquiring book:", error);
    return NextResponse.json(
      { error: "Failed to acquire book" },
      { status: 500 },
    );
  }
}
