import { NextResponse } from "next/server";
import { bookRepository } from "@/lib/db/repositories/books-repository";

export async function GET() {
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
