import { NextResponse } from "next/server";
import { bookRepository } from "@/lib/db/repositories/books";

export async function GET() {
  try {
    const publicBooks = await bookRepository.findVisible();
    return NextResponse.json(publicBooks);
  } catch (error) {
    console.error("Error fetching books:", error);
    return NextResponse.json(
      { error: "Failed to fetch books" },
      { status: 500 },
    );
  }
}
