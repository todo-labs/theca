"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, ChevronRight } from "lucide-react";
import { BookMetadata } from "@/components/book/book-metadata";
import { useBooks, Book } from "@/hooks/queries/use-books";

export function RollingBookshelf() {
  const { data: books = [], isLoading: loading } = useBooks();
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const groupedBooks = {
    currentlyReading: books.filter(
      (b) => b.readingStatus === "currently_reading",
    ),
    nextUp: books.filter((b) => b.readingStatus === "want_to_read"),
    finished: books.filter((b) => b.readingStatus === "completed"),
  };

  const handleBookClick = (book: Book) => {
    setSelectedBook(book);
  };

  const handleClose = () => {
    setSelectedBook(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground font-sans flex items-center justify-center">
        <p className="text-muted-foreground">Loading books...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/10 selection:text-primary">
      <div className="max-w-7xl mx-auto px-8 lg:px-16 py-12 space-y-16">
        {/* Currently Reading Section */}
        <BookSection
          title="Currently reading"
          books={groupedBooks.currentlyReading}
          onBookClick={handleBookClick}
        />

        {/* Next Up Section */}
        <BookSection
          title="Next up"
          books={groupedBooks.nextUp}
          onBookClick={handleBookClick}
          showViewAll
        />

        {/* Finished Section */}
        <BookSection
          title="Finished"
          books={groupedBooks.finished}
          onBookClick={handleBookClick}
          showViewAll
        />
      </div>

      {/* Book Detail Modal */}
      <AnimatePresence>
        {selectedBook && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-8"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-6xl bg-card rounded-lg shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-6 right-6 z-10 p-2 rounded-full bg-background/80 hover:bg-background transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_1px_1.5fr] min-h-[600px]">
                {/* Book Cover */}
                <section className="relative flex flex-col items-center justify-center bg-muted/30 py-16 px-8">
                  <div className="relative z-10">
                    <div className="relative shadow-2xl shadow-black/15 rounded-sm overflow-hidden">
                      <Image
                        src={
                          selectedBook.coverImageUrl ||
                          "/images/fantasy-cover.png"
                        }
                        alt={selectedBook.title || "Book cover"}
                        width={420}
                        height={630}
                        className="h-auto w-[320px] lg:w-[380px] object-cover"
                      />
                    </div>
                  </div>
                </section>

                {/* Divider */}
                <div className="hidden lg:block bg-border/40" />

                {/* Book Details */}
                <section className="flex flex-col justify-center px-10 py-12 lg:px-14 xl:px-16 overflow-y-auto">
                  <div className="space-y-8 max-w-md">
                    <div className="space-y-3">
                      <h1 className="font-serif text-[2.75rem] leading-[1.05] font-normal text-foreground tracking-tight">
                        {selectedBook.title}
                      </h1>
                      <p className="text-[10px] font-bold tracking-[0.25em] text-muted-foreground/70 uppercase pt-1">
                        by {selectedBook.author}
                      </p>
                    </div>

                    {selectedBook.description && (
                      <div className="space-y-5 text-[13px] leading-[1.7] text-muted-foreground/85">
                        {selectedBook.description}
                      </div>
                    )}

                    {(selectedBook.publisher ||
                      selectedBook.publicationYear ||
                      selectedBook.pageCount ||
                      selectedBook.isbn) && (
                      <>
                        <div className="border-t border-border/30 my-6" />
                        <BookMetadata
                          items={[
                            ...(selectedBook.publisher
                              ? [
                                  {
                                    label: "Publisher",
                                    value: selectedBook.publisher,
                                  },
                                ]
                              : []),
                            ...(selectedBook.publicationYear
                              ? [
                                  {
                                    label: "Year",
                                    value: String(selectedBook.publicationYear),
                                  },
                                ]
                              : []),
                            ...(selectedBook.pageCount
                              ? [
                                  {
                                    label: "Pages",
                                    value: String(selectedBook.pageCount),
                                  },
                                ]
                              : []),
                            ...(selectedBook.isbn
                              ? [{ label: "ISBN", value: selectedBook.isbn }]
                              : []),
                          ]}
                        />
                      </>
                    )}
                  </div>
                </section>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface BookSectionProps {
  title: string;
  books: Book[];
  onBookClick: (book: Book) => void;
  showViewAll?: boolean;
}

function BookSection({
  title,
  books,
  onBookClick,
  showViewAll,
}: BookSectionProps) {
  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-muted-foreground tracking-tight">
          {title}
        </h2>
        {showViewAll && (
          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
            <span>Full shelf</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>

      {/* Shelf Background */}
      <div className="relative">
        {/* Books Container */}
        <div className="flex gap-6 pb-8 overflow-x-auto no-scrollbar">
          {books.map((book) => (
            <motion.div
              key={book.id}
              whileHover={{ y: -8 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="flex-shrink-0 cursor-pointer group"
              onClick={() => onBookClick(book)}
            >
              <div className="relative w-[140px] aspect-[2/3] rounded-sm overflow-hidden shadow-lg group-hover:shadow-2xl transition-shadow">
                <Image
                  src={book.coverImageUrl || "/images/fantasy-cover.png"}
                  alt={book.title || "Book cover"}
                  fill
                  className="object-cover"
                />
              </div>
              {/* Progress bar for currently reading */}
              {title === "Currently reading" &&
                book.pageCount &&
                book.currentPage && (
                  <div className="mt-3 w-full h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{
                        width: `${(book.currentPage / book.pageCount) * 100}%`,
                      }}
                    />
                  </div>
                )}
            </motion.div>
          ))}
        </div>

        {/* Shelf */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-b from-muted/40 to-muted/60 rounded-sm shadow-inner" />
      </div>
    </section>
  );
}
