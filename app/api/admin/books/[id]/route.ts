import { NextRequest, NextResponse } from "next/server";
import { bookRepository } from "@/lib/db/repositories/books-repository";
import { ReadingStatus } from "@/lib/db/schema";
import { requireAuth } from "@/lib/middleware";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const auth = await requireAuth(request);
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const bookId = parseInt(id, 10);

    if (isNaN(bookId)) {
      return NextResponse.json({ error: "Invalid book ID" }, { status: 400 });
    }

    const [book] = await bookRepository.findById(bookId);

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    return NextResponse.json(book);
  } catch (error) {
    console.error("Error fetching book:", error);
    return NextResponse.json(
      { error: "Failed to fetch book" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const auth = await requireAuth(request);
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const bookId = parseInt(id, 10);

    if (isNaN(bookId)) {
      return NextResponse.json({ error: "Invalid book ID" }, { status: 400 });
    }

    const body = await request.json();

    // Prepare update data
    const updateData: any = {};

    // Basic fields
    if (body.title !== undefined) updateData.title = body.title;
    if (body.subtitle !== undefined) updateData.subtitle = body.subtitle;
    if (body.author !== undefined) updateData.author = body.author;
    if (body.isbn !== undefined) updateData.isbn = body.isbn;
    if (body.genre !== undefined) updateData.genre = body.genre;
    if (body.themes !== undefined) updateData.themes = body.themes;
    if (body.publicationYear !== undefined) updateData.publicationYear = body.publicationYear;
    if (body.publisher !== undefined) updateData.publisher = body.publisher;
    if (body.pageCount !== undefined) updateData.pageCount = body.pageCount;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.coverImageUrl !== undefined) updateData.coverImageUrl = body.coverImageUrl;
    if (body.coverImagePath !== undefined) updateData.coverImagePath = body.coverImagePath;
    if (body.coverImageHash !== undefined) updateData.coverImageHash = body.coverImageHash;
    if (body.readingStatus !== undefined) updateData.readingStatus = body.readingStatus as ReadingStatus;
    if (body.personalRating !== undefined) updateData.personalRating = body.personalRating;
    if (body.personalNotes !== undefined) updateData.personalNotes = body.personalNotes;
    if (body.currentPage !== undefined) updateData.currentPage = body.currentPage;
    if (body.isVisiblePublicly !== undefined) updateData.isVisiblePublicly = body.isVisiblePublicly;

    // Date fields
    if (body.dateStarted !== undefined) {
      updateData.dateStarted = body.dateStarted ? new Date(body.dateStarted) : null;
    }
    if (body.dateFinished !== undefined) {
      updateData.dateFinished = body.dateFinished ? new Date(body.dateFinished) : null;
    }

    const [updatedBook] = await bookRepository.update(bookId, updateData);

    if (!updatedBook) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    return NextResponse.json(updatedBook);
  } catch (error) {
    console.error("Error updating book:", error);
    return NextResponse.json(
      { error: "Failed to update book" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const auth = await requireAuth(request);
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const bookId = parseInt(id, 10);

    if (isNaN(bookId)) {
      return NextResponse.json({ error: "Invalid book ID" }, { status: 400 });
    }

    const [deletedBook] = await bookRepository.delete(bookId);

    if (!deletedBook) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error("Error deleting book:", error);
    return NextResponse.json(
      { error: "Failed to delete book" },
      { status: 500 }
    );
  }
}
