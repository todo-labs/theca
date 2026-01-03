import { NextResponse } from "next/server";
import { bookRepository } from "@/lib/db/repositories/books";
import { ReadingStatus } from "@/lib/db/schema";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const bookId = parseInt(id);

    if (isNaN(bookId)) {
      return NextResponse.json({ error: "Invalid book ID" }, { status: 400 });
    }

    const body = await request.json();
    const status: ReadingStatus = body.status || "to_read";

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
