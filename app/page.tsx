"use client";

import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { BookCover } from "@/components/book/book-cover";
import { BookDetails } from "@/components/book/book-details";
import { Sidebar } from "@/components/bookshelf/sidebar";
import { EmptyLibrary } from "@/components/empty-library";
import { useBooks } from "@/hooks/queries/use-books";
import { useWishlist } from "@/hooks/queries/use-wishlist";
import { CopyButton } from "@/components/ui/copy-button";
import { Button } from "@/components/ui/button";
import { Gift, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function BookListingPage() {
  const { data: libraryBooks = [], isLoading: libraryLoading } = useBooks();
  const { data: wishlistBooks = [], isLoading: wishlistLoading } =
    useWishlist();

  const [viewMode, setViewMode] = useState<"library" | "wishlist">("library");
  const [selectedBookIndex, setSelectedBookIndex] = useState(0);
  const sidebarItemsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const handleViewChange = (e: CustomEvent) => {
      setViewMode(e.detail);
      setSelectedBookIndex(0);
    };
    window.addEventListener(
      "wishlistViewChange",
      handleViewChange as EventListener,
    );
    return () =>
      window.removeEventListener(
        "wishlistViewChange",
        handleViewChange as EventListener,
      );
  }, []);

  const isWishlistView = viewMode === "wishlist";
  const books = isWishlistView ? wishlistBooks : libraryBooks;
  const isLoading = isWishlistView ? wishlistLoading : libraryLoading;

  const sortedBooks = [...books].sort((a, b) => a.title.localeCompare(b.title));

  const selectedBook =
    sortedBooks.length > 0 ? sortedBooks[selectedBookIndex] : null;

  const handleBookSelect = (index: number) => {
    setSelectedBookIndex(index);
  };

  const EmptyState = () => (
    <div className="col-span-full flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-6 text-center max-w-md">
        <div className="p-4 bg-muted/30 rounded-full">
          <Gift className="w-8 h-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-medium">
            {isWishlistView
              ? "Your wishlist is empty"
              : "Your library is empty"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isWishlistView
              ? "Add books to your wishlist from recommendations or manually."
              : "Start by adding some books to your library."}
          </p>
        </div>
        <Link href="/admin/books">
          <Button className="text-[11px] font-bold tracking-[0.2em] uppercase">
            {isWishlistView ? "Browse Recommendations" : "Add Books"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/10 selection:text-primary">
      <Header />

      <main className="relative grid grid-cols-1 lg:grid-cols-[1fr_1px_1fr_1px_auto] h-[calc(100vh-64px)] overflow-hidden">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-muted-foreground text-sm">
                {isWishlistView
                  ? "Loading your wishlist..."
                  : "Loading your library..."}
              </p>
            </div>
          </div>
        ) : sortedBooks.length === 0 ? (
          <EmptyState />
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
                metadata={
                  [
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
                    isWishlistView &&
                      selectedBook?.purchaseUrl && {
                        label: "Purchase",
                        value: (
                          <a
                            href={selectedBook.purchaseUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            View on Store
                            <ArrowRight className="w-3 h-3" />
                          </a>
                        ),
                      },
                  ].filter(Boolean) as {
                    label: string;
                    value: React.ReactNode;
                  }[]
                }
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
