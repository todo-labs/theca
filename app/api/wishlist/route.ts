import { NextRequest, NextResponse } from "next/server";
import { bookRepository } from "@/lib/db/repositories/books";
import { settingsRepository } from "@/lib/db/repositories/settings";
import { requireAuth } from "@/lib/middleware";
import { z } from "zod";

const wishlistItemSchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  subtitle: z.string().max(500).optional(),
  author: z.string().min(1, "Author is required").max(200),
  isbn: z.string().max(20).optional(),
  genre: z.string().max(100).optional(),
  publicationYear: z.number().int().min(1000).max(2100).optional(),
  publisher: z.string().max(200).optional(),
  pageCount: z.number().int().min(1).max(50000).optional(),
  description: z.string().max(10000).optional(),
  coverImageUrl: z.string().url().max(2000).optional(),
  wishlistPriority: z.number().int().min(1).max(100).optional(),
  purchaseUrl: z.string().url().max(2000).optional(),
});

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

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validationResult = wishlistItemSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.flatten() },
        { status: 400 },
      );
    }

    const validated = validationResult.data;

    const bookData = {
      title: validated.title,
      subtitle: validated.subtitle || null,
      author: validated.author,
      isbn: validated.isbn || null,
      genre: validated.genre || null,
      publicationYear: validated.publicationYear || null,
      publisher: validated.publisher || null,
      pageCount: validated.pageCount || null,
      description: validated.description || null,
      coverImageUrl: validated.coverImageUrl || null,
      readingStatus: "to_read" as const,
      isWishlist: true,
      wishlistPriority: validated.wishlistPriority || null,
      purchaseUrl: validated.purchaseUrl || null,
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
