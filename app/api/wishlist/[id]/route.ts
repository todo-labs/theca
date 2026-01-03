import { NextRequest, NextResponse } from "next/server";
import { bookRepository } from "@/lib/db/repositories/books";
import { requireAuth } from "@/lib/middleware";
import { z } from "zod";

const wishlistUpdateSchema = z.object({
  wishlistPriority: z.number().int().min(1).max(100).optional(),
  purchaseUrl: z.string().url().max(2000).optional().or(z.literal("")),
});

export async function PUT(
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
    const validationResult = wishlistUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.flatten() },
        { status: 400 },
      );
    }

    const validated = validationResult.data;

    const result = await bookRepository.updateWishlist(bookId, {
      wishlistPriority: validated.wishlistPriority,
      purchaseUrl: validated.purchaseUrl || undefined,
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
