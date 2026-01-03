import { NextRequest, NextResponse } from "next/server";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { z } from "zod";
import { requireAuth } from "@/lib/middleware";

const bookFromImageSchema = z.object({
  title: z.string(),
  author: z.string().nullable(),
  confidence: z.number().min(0).max(1),
});

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const image = formData.get("image") as File;

    if (!image) {
      return NextResponse.json(
        { error: "Image is required" },
        { status: 400 }
      );
    }

    // Convert image to base64
    const bytes = await image.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimeType = image.type || "image/jpeg";
    const dataUrl = `data:${mimeType};base64,${base64}`;

    const openrouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    // Use vision model to identify the book
    const result = await generateText({
      model: openrouter("google/gemini-2.0-flash-lite-001"),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              image: dataUrl,
            },
            {
              type: "text",
              text: `You are a book identification expert. Look at this book cover image and identify the book.

Extract the following information:
1. Book title (as shown on the cover)
2. Author name (if visible on the cover)
3. Your confidence level (0.0 to 1.0) in your identification

Return ONLY a JSON object in this exact format:
{
  "title": "The Book Title",
  "author": "Author Name or null if not visible",
  "confidence": 0.95
}

If you cannot identify a book in the image, return:
{
  "title": "Unknown",
  "author": null,
  "confidence": 0.0
}

Return ONLY the JSON, no other text.`,
            },
          ],
        },
      ],
      temperature: 0.1,
    });

    // Parse the response
    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const bookInfo = bookFromImageSchema.parse(parsed);
        
        // If we identified the book with reasonable confidence, search for metadata
        if (bookInfo.confidence > 0.3 && bookInfo.title !== "Unknown") {
          // Search Google Books for additional metadata
          const searchQuery = encodeURIComponent(
            `${bookInfo.title}${bookInfo.author ? ` ${bookInfo.author}` : ""}`
          );
          const googleResponse = await fetch(
            `https://www.googleapis.com/books/v1/volumes?q=${searchQuery}&maxResults=1`
          );

          if (googleResponse.ok) {
            const data = await googleResponse.json();
            if (data.items && data.items.length > 0) {
              const item = data.items[0].volumeInfo;
              return NextResponse.json({
                identified: true,
                confidence: bookInfo.confidence,
                book: {
                  title: item.title || bookInfo.title,
                  subtitle: item.subtitle || null,
                  author: item.authors?.[0] || bookInfo.author,
                  isbn: item.industryIdentifiers?.find(
                    (id: any) => id.type === "ISBN_13"
                  )?.identifier || item.industryIdentifiers?.find(
                    (id: any) => id.type === "ISBN_10"
                  )?.identifier || null,
                  genre: item.categories?.[0] || null,
                  publicationYear: item.publishedDate
                    ? parseInt(item.publishedDate.substring(0, 4))
                    : null,
                  publisher: item.publisher || null,
                  pageCount: item.pageCount || null,
                  description: item.description || null,
                  themes: null,
                  coverImageUrl: item.imageLinks?.thumbnail?.replace(
                    "http://",
                    "https://"
                  ) || null,
                },
              });
            }
          }

          // Return just what we got from vision
          return NextResponse.json({
            identified: true,
            confidence: bookInfo.confidence,
            book: {
              title: bookInfo.title,
              subtitle: null,
              author: bookInfo.author,
              isbn: null,
              genre: null,
              publicationYear: null,
              publisher: null,
              pageCount: null,
              description: null,
              themes: null,
              coverImageUrl: null,
            },
          });
        }

        return NextResponse.json({
          identified: false,
          confidence: bookInfo.confidence,
          message: "Could not identify the book from this image",
        });
      }
    } catch (parseError) {
      console.error("Failed to parse vision response:", parseError);
    }

    return NextResponse.json({
      identified: false,
      confidence: 0,
      message: "Failed to process the image",
    });
  } catch (error) {
    console.error("Error identifying book from image:", error);
    return NextResponse.json(
      { error: "Failed to identify book" },
      { status: 500 }
    );
  }
}
