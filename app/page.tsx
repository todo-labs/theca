"use client";

import { useState, useRef } from "react";
import { Header } from "@/components/layout/header";
import { BookCover } from "@/components/book/book-cover";
import { BookDetails } from "@/components/book/book-details";
import { Sidebar } from "@/components/bookshelf/sidebar";
import { EmptyLibrary } from "@/components/empty-library";
import { useBooks } from "@/hooks/queries/use-books";

import { CopyButton } from "@/components/ui/copy-button";

export default function BookListingPage() {
  const { data: books = [], isLoading: loading } = useBooks();
  
  // Sort books alphabetically by title
  const sortedBooks = [...books].sort((a, b) => a.title.localeCompare(b.title));
  
  const [selectedBookIndex, setSelectedBookIndex] = useState(0);
  const sidebarItemsRef = useRef<(HTMLDivElement | null)[]>([]);

  const selectedBook = sortedBooks.length > 0 ? sortedBooks[selectedBookIndex] : null;

  const handleBookSelect = (index: number) => {
    setSelectedBookIndex(index);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/10 selection:text-primary">
      <Header />

      <main className="relative grid grid-cols-1 lg:grid-cols-[1fr_1px_1fr_1px_auto] h-[calc(100vh-64px)] overflow-hidden">
        {loading ? (
          <div className="col-span-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-muted-foreground text-sm">Loading your library...</p>
            </div>
          </div>
        ) : books.length === 0 ? (
          <EmptyLibrary />
        ) : (
          <>
            <BookCover
              src={selectedBook?.coverImageUrl || "/images/fantasy-cover.png"}
              alt={selectedBook?.title || "Book cover"}
            />

            <div className="hidden lg:block bg-border/40" />

            <div className="h-full overflow-y-auto">
              <BookDetails
                title={selectedBook?.title || ""}
                author={selectedBook?.author || ""}
                description={selectedBook?.description || ""}
                metadata={[
                  selectedBook?.publisher && {
                    label: "Publisher",
                    value: selectedBook.publisher,
                  },
                  selectedBook?.publicationYear && {
                    label: "Year",
                    value: String(selectedBook.publicationYear),
                  },
                  selectedBook?.pageCount && {
                    label: "Pages",
                    value: String(selectedBook.pageCount),
                  },
                  selectedBook?.isbn && {
                    label: "ISBN",
                    value: (
                      <div className="flex items-center gap-2">
                        <span>{selectedBook.isbn}</span>
                        <CopyButton value={selectedBook.isbn} />
                      </div>
                    ),
                  },
                ].filter(Boolean) as { label: string; value: React.ReactNode }[]}
              />
            </div>

            <div className="hidden lg:block bg-border/40" />

            <Sidebar
              books={sortedBooks.map((book: any) => ({
                id: String(book.id),
                coverSrc: book.coverImageUrl || "/images/fantasy-cover.png",
                coverAlt: book.title || "Book cover",
              }))}
              selectedIndex={selectedBookIndex}
              onSelectBook={handleBookSelect}
              itemsRef={sidebarItemsRef}
            />
          </>
        )}
      </main>
    </div>
  );
}
