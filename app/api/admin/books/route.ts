import { NextRequest, NextResponse } from "next/server";
import {
  bookRepository,
  NewBook,
} from "@/lib/db/repositories/books-repository";
import { books, ReadingStatus } from "@/lib/db/schema";
import { requireAuth } from "@/lib/middleware";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const allBooks = await bookRepository.findAll();
    return NextResponse.json(allBooks);
  } catch (error) {
    console.error("Error fetching books:", error);
    return NextResponse.json(
      { error: "Failed to fetch books" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const newBook: NewBook = {
      title: body.title,
      subtitle: body.subtitle || null,
      author: body.author,
      isbn: body.isbn || null,
      genre: body.genre || null,
      themes: body.themes || null,
      publicationYear: body.publicationYear || null,
      publisher: body.publisher || null,
      pageCount: body.pageCount || null,
      description: body.description || null,
      coverImageUrl: body.coverImageUrl || null,
      coverImagePath: body.coverImagePath || null,
      coverImageHash: body.coverImageHash || null,
      readingStatus: (body.readingStatus as ReadingStatus) || "want_to_read",
      personalRating: body.personalRating || null,
      personalNotes: body.personalNotes || null,
      dateAdded: new Date(),
      dateStarted: body.dateStarted ? new Date(body.dateStarted) : null,
      dateFinished: body.dateFinished ? new Date(body.dateFinished) : null,
      currentPage: body.currentPage || 0,
      isVisiblePublicly: body.isVisiblePublicly || false,
      metadataSource: body.metadataSource || "manual",
      lastAiRefreshed: body.lastAiRefreshed
        ? new Date(body.lastAiRefreshed)
        : null,
    };

    const [createdBook] = await bookRepository.create(newBook);
    return NextResponse.json(createdBook, { status: 201 });
  } catch (error) {
    console.error("Error creating book:", error);
    return NextResponse.json(
      { error: "Failed to create book" },
      { status: 500 },
    );
  }
}
