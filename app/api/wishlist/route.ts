import { NextResponse } from "next/server";
import { bookRepository } from "@/lib/db/repositories/books";
import { settingsRepository } from "@/lib/db/repositories/settings";

export async function GET() {
  try {
    const showWishlistPublicly = await settingsRepository.getBoolean(
      "showWishlistPublicly",
    );

    let wishlist;
    if (showWishlistPublicly) {
      wishlist = await bookRepository.findWishlistPublic();
    } else {
      wishlist = await bookRepository.findWishlist();
    }

    return NextResponse.json(wishlist);
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json(
      { error: "Failed to fetch wishlist" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const bookData = {
      title: body.title,
      subtitle: body.subtitle,
      author: body.author,
      isbn: body.isbn || null,
      genre: body.genre || null,
      publicationYear: body.publicationYear || null,
      publisher: body.publisher || null,
      pageCount: body.pageCount || null,
      description: body.description || null,
      coverImageUrl: body.coverImageUrl || null,
      readingStatus: "to_read" as const,
      isWishlist: true,
      wishlistPriority: body.wishlistPriority || null,
      purchaseUrl: body.purchaseUrl || null,
      dateAddedToWishlist: new Date(),
    };

    const result = await bookRepository.create(bookData);
    const newBook = result[0];

    return NextResponse.json(newBook, { status: 201 });
  } catch (error) {
    console.error("Error creating wishlist item:", error);
    return NextResponse.json(
      { error: "Failed to create wishlist item" },
      { status: 500 },
    );
  }
}
