import { NextResponse } from "next/server";
import { bookRepository } from "@/lib/db/repositories/books";

export async function PUT(
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
    const { wishlistPriority, purchaseUrl } = body;

    const result = await bookRepository.updateWishlist(bookId, {
      wishlistPriority,
      purchaseUrl,
    });
    const updatedBook = result[0];

    if (!updatedBook) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    return NextResponse.json(updatedBook);
  } catch (error) {
    console.error("Error updating wishlist item:", error);
    return NextResponse.json(
      { error: "Failed to update wishlist item" },
      { status: 500 },
    );
  }
}
