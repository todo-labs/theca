import { NextRequest, NextResponse } from "next/server";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText, tool } from "ai";
import { z } from "zod";
import { requireAuth } from "@/lib/middleware";
import Exa from "exa-js";

// Response schema for the API
const bookDetailsSchema = z.object({
  title: z.string(),
  subtitle: z.string().nullable(),
  author: z.string(),
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

// Tool definitions for the agent
const searchExaTool = tool({
  description:
    "Search the web using Exa for book information. Use this to find general information about a book including reviews, publisher info, and descriptions.",
  parameters: z.object({
    query: z
      .string()
      .describe("The search query to find book information"),
  }),
  execute: async ({ query }: { query: string }) => {
    try {
      if (!process.env.EXA_API_KEY) {
        return { error: "EXA_API_KEY not configured", results: [] as any[] };
      }

      const exa = new Exa(process.env.EXA_API_KEY);
      const results = await exa.searchAndContents(query, {
        type: "auto",
        numResults: 5,
        text: true,
      });

      if (!results.results || results.results.length === 0) {
        return { results: [] as any[], message: "No results found" };
      }

      return {
        results: results.results.map((r: any) => ({
          title: r.title,
          url: r.url,
          text: r.text?.substring(0, 2000) || "",
        })),
      };
    } catch (error: any) {
      return { error: error.message, results: [] as any[] };
    }
  },
});

const searchGoogleBooksTool = tool({
  description:
    "Search Google Books API for detailed book information including ISBN, page count, cover image, publisher, and publication date. This is the best source for accurate metadata.",
  parameters: z.object({
    title: z.string().describe("The book title to search for"),
    author: z.string().describe("The author name to search for"),
  }),
  execute: async ({ title, author }: { title: string; author: string }) => {
    try {
      const query = encodeURIComponent(`intitle:${title}+inauthor:${author}`);
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=5`,
      );

      if (!response.ok) {
        return { error: `Google Books API error: ${response.status}`, books: [] as any[] };
      }

      const data = await response.json();

      if (!data.items || data.items.length === 0) {
        return { books: [] as any[], message: "No books found" };
      }

      return {
        books: data.items.map((item: any) => ({
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
          coverImage: item.volumeInfo?.imageLinks?.thumbnail?.replace(
            "http://",
            "https://",
          ),
          coverImageLarge: item.volumeInfo?.imageLinks?.large?.replace(
            "http://",
            "https://",
          ),
        })),
      };
    } catch (error: any) {
      return { error: error.message, books: [] as any[] };
    }
  },
});

const searchOpenLibraryTool = tool({
  description:
    "Search Open Library API for book information. Use this as a fallback or to find additional details like ISBN and cover images.",
  parameters: z.object({
    title: z.string().describe("The book title to search for"),
    author: z.string().describe("The author name to search for"),
  }),
  execute: async ({ title, author }: { title: string; author: string }) => {
    try {
      const query = encodeURIComponent(`${title} ${author}`);
      const response = await fetch(
        `https://openlibrary.org/search.json?q=${query}&limit=5`,
      );

      if (!response.ok) {
        return { error: `Open Library API error: ${response.status}`, books: [] as any[] };
      }

      const data = await response.json();

      if (!data.docs || data.docs.length === 0) {
        return { books: [] as any[], message: "No books found" };
      }

      return {
        books: data.docs.map((doc: any) => ({
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
        })),
      };
    } catch (error: any) {
      return { error: error.message, books: [] as any[] };
    }
  },
});

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, author } = body;

    if (!title || !author) {
      return NextResponse.json(
        { error: "Title and author are required" },
        { status: 400 },
      );
    }

    const openrouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    // Run the agent with tools
    const result = await generateText({
      model: openrouter("openai/gpt-4o-mini"),
      tools: {
        searchExa: searchExaTool,
        searchGoogleBooks: searchGoogleBooksTool,
        searchOpenLibrary: searchOpenLibraryTool,
      },
      maxToolRoundtrips: 5, // Allow multiple tool calls
      prompt: `You are a book research agent. Your job is to find COMPLETE and ACCURATE information about the book "${title}" by ${author}.

You MUST be aggressive and thorough in your research. Do NOT give up if the first search doesn't return all information.

Required information to find:
1. Exact title and subtitle
2. Author's full name
3. ISBN (10 or 13 digit) - THIS IS CRITICAL
4. Publisher name
5. Publication year
6. Page count - THIS IS IMPORTANT
7. Book description/summary
8. Genre or categories
9. Main themes
10. Cover image URL - THIS IS IMPORTANT

STRATEGY:
1. FIRST: Always search Google Books API - this is the best source for ISBN, page count, and cover images
2. SECOND: Search Open Library for additional details and a backup cover image
3. THIRD: If needed, use Exa to search for reviews or additional context

BE AGGRESSIVE: If Google Books doesn't have complete info, try Open Library. If that fails, search Exa with specific queries like "[title] ISBN" or "[title] page count".

After gathering all information, provide a comprehensive summary of what you found.`,
      temperature: 0.2,
    });

    // Extract book details from the agent's research
    const toolResults: any[] = [];
    if (result.toolCalls) {
      for (const toolCall of result.toolCalls) {
        toolResults.push({
          tool: toolCall.toolName,
          args: toolCall.args,
        });
      }
    }
    if (result.toolResults) {
      for (let i = 0; i < result.toolResults.length; i++) {
        const tr = result.toolResults[i] as any;
        if (toolResults[i]) {
          toolResults[i].result = tr.result;
        } else {
          toolResults.push({ tool: tr.toolName, result: tr.result });
        }
      }
    }

    // Now use GPT to synthesize the results into structured data
    const synthesisResult = await generateText({
      model: openrouter("openai/gpt-4o-mini"),
      prompt: `Based on the following research results, extract the book details for "${title}" by ${author}.

RESEARCH RESULTS:
${JSON.stringify(toolResults, null, 2)}

AGENT SUMMARY:
${result.text}

Provide a JSON object with these fields (use null for unknown values):
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
- For cover images, prefer Open Library's -L.jpg URLs or Google Books thumbnails
- Return ONLY the JSON object, no other text`,
      temperature: 0.1,
    });

    // Parse the synthesized result
    let bookDetails: BookDetails;
    try {
      // Extract JSON from the response
      const jsonMatch = synthesisResult.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }
      const parsed = JSON.parse(jsonMatch[0]);
      bookDetails = bookDetailsSchema.parse(parsed);
    } catch (parseError) {
      console.error("Failed to parse synthesis result:", parseError);
      console.error("Raw text:", synthesisResult.text);

      // Return partial data with what we have
      bookDetails = {
        title: title,
        subtitle: null,
        author: author,
        isbn: null,
        genre: null,
        publicationYear: null,
        publisher: null,
        pageCount: null,
        description: null,
        themes: null,
        coverImageUrl: null,
      };

      // Try to extract any data from tool results
      for (const tr of toolResults) {
        if (tr.tool === "searchGoogleBooks" && tr.result?.books?.length > 0) {
          const book = tr.result.books[0];
          bookDetails.isbn = book.isbn13 || book.isbn10 || bookDetails.isbn;
          bookDetails.pageCount = book.pageCount || bookDetails.pageCount;
          bookDetails.publisher = book.publisher || bookDetails.publisher;
          bookDetails.coverImageUrl = book.coverImageLarge || book.coverImage || bookDetails.coverImageUrl;
          bookDetails.description = book.description || bookDetails.description;
          bookDetails.publicationYear = book.publishedDate
            ? parseInt(book.publishedDate.substring(0, 4))
            : bookDetails.publicationYear;
          bookDetails.genre = book.categories?.[0] || bookDetails.genre;
        }
        if (tr.tool === "searchOpenLibrary" && tr.result?.books?.length > 0) {
          const book = tr.result.books[0];
          bookDetails.isbn = bookDetails.isbn || book.isbn;
          bookDetails.pageCount = bookDetails.pageCount || book.pageCount;
          bookDetails.coverImageUrl = bookDetails.coverImageUrl || book.coverUrl;
          bookDetails.publicationYear = bookDetails.publicationYear || book.firstPublishYear;
          bookDetails.themes = bookDetails.themes || book.subjects;
        }
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
