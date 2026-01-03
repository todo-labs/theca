import { NextRequest, NextResponse } from "next/server";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { z } from "zod";
import { requireAuth } from "@/lib/middleware";

// Response schema for the API
const bookDetailsSchema = z.object({
  title: z.string(),
  subtitle: z.string().nullable(),
  author: z.string().nullable(),
  isbn: z.string().nullable(),
  genre: z.string().nullable(),
  publicationYear: z.number().nullable(),
  publisher: z.string().nullable(),
  pageCount: z.number().nullable(),
  description: z.string().nullable(),
  themes: z.array(z.string()).nullable(),
  coverImageUrl: z.string().nullable(),
});

type BookDetails = z.infer<typeof bookDetailsSchema>;

// Direct API calls instead of agent tools
async function searchGoogleBooks(searchQuery: string) {
  try {
    const query = encodeURIComponent(searchQuery);
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=5`,
    );

    if (!response.ok) {
      console.error("Google Books API error:", response.status);
      return [];
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return [];
    }

    return data.items.map((item: any) => {
      const imageLinks = item.volumeInfo?.imageLinks || {};
      
      // Get the highest resolution available from Google Books
      // Priority: extraLarge > large > medium > small > thumbnail
      let coverImage = 
        imageLinks.extraLarge ||
        imageLinks.large ||
        imageLinks.medium ||
        imageLinks.small ||
        imageLinks.thumbnail;
      
      // If we only have a thumbnail, try to get a higher res version
      // Google Books thumbnails can be upgraded by changing zoom parameter
      if (coverImage && coverImage.includes('zoom=1')) {
        coverImage = coverImage.replace('zoom=1', 'zoom=3');
      }
      
      // Also remove edge curl effect for cleaner images
      if (coverImage) {
        coverImage = coverImage
          .replace('&edge=curl', '')
          .replace('http://', 'https://');
      }

      return {
        title: item.volumeInfo?.title,
        subtitle: item.volumeInfo?.subtitle,
        authors: item.volumeInfo?.authors,
        publisher: item.volumeInfo?.publisher,
        publishedDate: item.volumeInfo?.publishedDate,
        description: item.volumeInfo?.description,
        pageCount: item.volumeInfo?.pageCount,
        categories: item.volumeInfo?.categories,
        isbn10: item.volumeInfo?.industryIdentifiers?.find(
          (id: any) => id.type === "ISBN_10",
        )?.identifier,
        isbn13: item.volumeInfo?.industryIdentifiers?.find(
          (id: any) => id.type === "ISBN_13",
        )?.identifier,
        coverImage,
        coverImageLarge: coverImage, // Same as coverImage now since we're getting the best available
      };
    });
  } catch (error: any) {
    console.error("Google Books search error:", error);
    return [];
  }
}

async function searchOpenLibrary(searchQuery: string) {
  try {
    const query = encodeURIComponent(searchQuery);
    const response = await fetch(
      `https://openlibrary.org/search.json?q=${query}&limit=5`,
    );

    if (!response.ok) {
      console.error("Open Library API error:", response.status);
      return [];
    }

    const data = await response.json();

    if (!data.docs || data.docs.length === 0) {
      return [];
    }

    return data.docs.map((doc: any) => ({
      title: doc.title,
      author: doc.author_name?.[0],
      firstPublishYear: doc.first_publish_year,
      publisher: doc.publisher?.[0],
      isbn: doc.isbn?.[0],
      pageCount: doc.number_of_pages_median,
      coverId: doc.cover_i,
      coverUrl: doc.cover_i
        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
        : null,
      subjects: doc.subject?.slice(0, 5),
    }));
  } catch (error: any) {
    console.error("Open Library search error:", error);
    return [];
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, author, query } = body;

    if (!query && (!title || !author)) {
      return NextResponse.json(
        { error: "Query or title/author are required" },
        { status: 400 },
      );
    }

    const searchQuery = query || `${title} ${author}`;
    console.log("Searching for book:", searchQuery);

    // Search both APIs in parallel
    const [googleBooks, openLibraryBooks] = await Promise.all([
      searchGoogleBooks(searchQuery),
      searchOpenLibrary(searchQuery),
    ]);

    console.log("Google Books results:", googleBooks.length);
    console.log("Open Library results:", openLibraryBooks.length);

    // If we have results, try to synthesize them with AI
    if (googleBooks.length > 0 || openLibraryBooks.length > 0) {
      const openrouter = createOpenRouter({
        apiKey: process.env.OPENROUTER_API_KEY,
      });

      const synthesisResult = await generateText({
        model: openrouter("google/gemini-2.0-flash-lite-001"),
        prompt: `Based on the following search results, extract the best matching book details for the query: "${searchQuery}".

GOOGLE BOOKS RESULTS:
${JSON.stringify(googleBooks.slice(0, 3), null, 2)}

OPEN LIBRARY RESULTS:
${JSON.stringify(openLibraryBooks.slice(0, 3), null, 2)}

Pick the BEST matching book and provide a JSON object with these fields (use null for unknown values):
{
  "title": "exact book title",
  "subtitle": "subtitle or null",
  "author": "author name",
  "isbn": "ISBN-13 preferred, or ISBN-10",
  "genre": "primary genre",
  "publicationYear": 2020,
  "publisher": "publisher name",
  "pageCount": 300,
  "description": "book description",
  "themes": ["theme1", "theme2"],
  "coverImageUrl": "https://... cover image URL"
}

IMPORTANT: 
- Prefer Google Books data for ISBN and page count
- Use the highest resolution cover image available
- For cover images, prefer Open Library's coverUrl or Google Books coverImageLarge/coverImage
- Return ONLY the JSON object, no other text or markdown`,
        temperature: 0.1,
      });

      // Parse the synthesized result
      try {
        const jsonMatch = synthesisResult.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          const bookDetails = bookDetailsSchema.parse(parsed);
          return NextResponse.json(bookDetails);
        }
      } catch (parseError) {
        console.error("Failed to parse AI synthesis:", parseError);
        console.error("Raw response:", synthesisResult.text);
      }
    }

    // Fallback: Extract data directly from API results
    let bookDetails: BookDetails = {
      title: searchQuery,
      subtitle: null,
      author: null,
      isbn: null,
      genre: null,
      publicationYear: null,
      publisher: null,
      pageCount: null,
      description: null,
      themes: null,
      coverImageUrl: null,
    };

    // Use Google Books data first
    if (googleBooks.length > 0) {
      const book = googleBooks[0];
      bookDetails = {
        title: book.title || searchQuery,
        subtitle: book.subtitle || null,
        author: book.authors?.[0] || null,
        isbn: book.isbn13 || book.isbn10 || null,
        genre: book.categories?.[0] || null,
        publicationYear: book.publishedDate
          ? parseInt(book.publishedDate.substring(0, 4))
          : null,
        publisher: book.publisher || null,
        pageCount: book.pageCount || null,
        description: book.description || null,
        themes: null,
        coverImageUrl: book.coverImageLarge || book.coverImage || null,
      };
    }

    // Fill in missing data from Open Library
    if (openLibraryBooks.length > 0) {
      const olBook = openLibraryBooks[0];
      bookDetails.author = bookDetails.author || olBook.author;
      bookDetails.isbn = bookDetails.isbn || olBook.isbn;
      bookDetails.pageCount = bookDetails.pageCount || olBook.pageCount;
      bookDetails.publicationYear = bookDetails.publicationYear || olBook.firstPublishYear;
      bookDetails.themes = bookDetails.themes || olBook.subjects;
      
      // Prefer Open Library cover if available (higher quality)
      if (olBook.coverUrl) {
        bookDetails.coverImageUrl = olBook.coverUrl;
      }
    }

    // If we have an ISBN, try to get the highest quality cover from Open Library
    if (bookDetails.isbn) {
      const openLibraryCoverUrl = `https://covers.openlibrary.org/b/isbn/${bookDetails.isbn}-L.jpg`;
      // Check if the cover exists
      try {
        const coverCheck = await fetch(openLibraryCoverUrl, { method: 'HEAD' });
        if (coverCheck.ok && coverCheck.headers.get('content-length') !== '807') {
          // 807 bytes is the size of the "no cover" placeholder image
          bookDetails.coverImageUrl = openLibraryCoverUrl;
        }
      } catch (e) {
        // Ignore cover check errors
      }
    }

    return NextResponse.json(bookDetails);
  } catch (error) {
    console.error("Error fetching book details:", error);
    return NextResponse.json(
      { error: "Failed to fetch book details" },
      { status: 500 },
    );
  }
}
