"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Camera,
  Library,
  ArrowRight,
  ArrowLeft,
  X,
  Loader2,
  BookOpen,
  Check,
  RotateCcw,
  Plus,
  ImagePlus,
  CheckCircle2,
  AlertCircle,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCreateBook } from "@/hooks/queries/use-admin-books";
import { cn } from "@/lib/utils";
import Link from "next/link";

type Mode = "select" | "single-photo" | "bulk";
type BookStatus = "pending" | "identifying" | "identified" | "adding" | "added" | "error";

interface QueuedBook {
  id: string;
  file: File;
  preview: string;
  status: BookStatus;
  bookData?: any;
  error?: string;
}

export default function AddBooksPage() {
  const [mode, setMode] = useState<Mode>("select");
  const [queue, setQueue] = useState<QueuedBook[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bulkInputRef = useRef<HTMLInputElement>(null);

  const createBook = useCreateBook();

  // Photo upload handlers
  const identifyBook = async (book: QueuedBook): Promise<any> => {
    const formData = new FormData();
    formData.append("image", book.file);

    const response = await fetch("/api/admin/books/identify", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to identify book");
    }

    return response.json();
  };

  const handleSinglePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const id = crypto.randomUUID();
    const preview = URL.createObjectURL(file);
    
    const newBook: QueuedBook = {
      id,
      file,
      preview,
      status: "identifying",
    };
    
    setQueue([newBook]);

    try {
      const result = await identifyBook(newBook);
      
      if (result.identified) {
        setQueue([{
          ...newBook,
          status: "identified",
          bookData: result.book,
        }]);
      } else {
        setQueue([{
          ...newBook,
          status: "error",
          error: result.message || "Could not identify book",
        }]);
      }
    } catch (error) {
      setQueue([{
        ...newBook,
        status: "error",
        error: "Failed to process image",
      }]);
    }
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newBooks: QueuedBook[] = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      status: "pending" as BookStatus,
    }));

    setQueue(newBooks);
  };

  const processQueue = async () => {
    setIsProcessing(true);
    
    for (let i = 0; i < queue.length; i++) {
      const book = queue[i];
      if (book.status !== "pending") continue;

      // Update status to identifying
      setQueue(prev => prev.map((b, idx) => 
        idx === i ? { ...b, status: "identifying" as BookStatus } : b
      ));

      try {
        const result = await identifyBook(book);
        
        setQueue(prev => prev.map((b, idx) => 
          idx === i ? {
            ...b,
            status: result.identified ? "identified" : "error",
            bookData: result.identified ? result.book : undefined,
            error: !result.identified ? result.message : undefined,
          } : b
        ));
      } catch (error) {
        setQueue(prev => prev.map((b, idx) => 
          idx === i ? {
            ...b,
            status: "error",
            error: "Failed to identify",
          } : b
        ));
      }

      // Small delay between requests
      await new Promise(r => setTimeout(r, 500));
    }

    setIsProcessing(false);
  };

  const addBookFromQueue = async (bookId: string, status: string) => {
    const book = queue.find(b => b.id === bookId);
    if (!book?.bookData) return;

    setQueue(prev => prev.map(b => 
      b.id === bookId ? { ...b, status: "adding" as BookStatus } : b
    ));

    try {
      await createBook.mutateAsync({
        ...book.bookData,
        readingStatus: status,
      });
      
      setQueue(prev => prev.map(b => 
        b.id === bookId ? { ...b, status: "added" as BookStatus } : b
      ));
      
      toast.success(`Added "${book.bookData.title}"`);
    } catch (error) {
      setQueue(prev => prev.map(b => 
        b.id === bookId ? { ...b, status: "error", error: "Failed to add" } : b
      ));
    }
  };

  const removeFromQueue = (bookId: string) => {
    setQueue(prev => prev.filter(b => b.id !== bookId));
  };

  const addAllIdentified = async () => {
    const identifiedBooks = queue.filter(b => b.status === "identified");
    
    for (const book of identifiedBooks) {
      await addBookFromQueue(book.id, "want_to_read");
    }
  };

  const resetMode = () => {
    setMode("select");
    setQueue([]);
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          {mode !== "select" && (
            <Button variant="ghost" size="icon" onClick={resetMode}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <div>
            <h1 className="font-serif text-3xl">Import from Photos</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === "select" && "Add books by uploading cover photos"}
              {mode === "single-photo" && "Upload a photo of your book cover"}
              {mode === "bulk" && "Import multiple books at once"}
            </p>
          </div>
        </div>
        <Link href="/admin/books">
          <Button variant="outline">
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </Link>
      </div>

      <AnimatePresence mode="wait">
        {/* Mode Selection */}
        {mode === "select" && (
          <motion.div
            key="select"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex items-center justify-center"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full">
              {[
                {
                  id: "single-photo",
                  icon: Camera,
                  title: "Single Photo",
                  description: "Upload one book cover and let AI identify it",
                  color: "from-purple-500/20 to-purple-600/10",
                },
                {
                  id: "bulk",
                  icon: Library,
                  title: "Bulk Import",
                  description: "Upload multiple book covers at once",
                  color: "from-amber-500/20 to-amber-600/10",
                },
              ].map((option) => (
                <motion.button
                  key={option.id}
                  onClick={() => setMode(option.id as Mode)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "group relative p-8 rounded-3xl border border-border/50 bg-gradient-to-br transition-all hover:border-primary/50 hover:shadow-xl",
                    option.color
                  )}
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-background/80 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <option.icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">{option.title}</h3>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                  <ArrowRight className="absolute bottom-6 right-6 w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Single Photo Mode */}
        {mode === "single-photo" && (
          <motion.div
            key="single-photo"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 max-w-2xl mx-auto w-full"
          >
            {queue.length === 0 ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-16 rounded-3xl border-2 border-dashed border-border/50 hover:border-primary/50 transition-colors cursor-pointer bg-muted/20"
              >
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <Camera className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">Upload Book Cover</h3>
                <p className="text-muted-foreground text-center max-w-sm">
                  Take a photo of your book cover or drag and drop an image here
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleSinglePhotoUpload}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-6">
                {queue.map((book) => (
                  <div key={book.id} className="flex gap-6 p-6 rounded-2xl bg-muted/30 border border-border/50">
                    <div className="shrink-0">
                      <div className="w-32 aspect-[2/3] rounded-lg overflow-hidden shadow-xl border border-border/50">
                        <img
                          src={book.preview}
                          alt="Uploaded cover"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      {book.status === "identifying" && (
                        <div className="flex items-center gap-3 h-full">
                          <Loader2 className="w-5 h-5 animate-spin text-primary" />
                          <span className="text-muted-foreground">Identifying book...</span>
                        </div>
                      )}
                      
                      {book.status === "identified" && book.bookData && (
                        <div className="space-y-4">
                          <div>
                            <div className="text-[10px] font-bold tracking-widest uppercase text-green-500 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Identified
                            </div>
                            <h2 className="text-xl font-serif mt-1">{book.bookData.title}</h2>
                            <p className="text-muted-foreground">{book.bookData.author}</p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-xs text-muted-foreground">Select reading status:</p>
                            <div className="grid grid-cols-3 gap-2">
                              {[
                                { id: "want_to_read", label: "Want to Read", icon: BookOpen },
                                { id: "currently_reading", label: "Reading", icon: RotateCcw },
                                { id: "completed", label: "Finished", icon: Check },
                              ].map((s) => (
                                <Button
                                  key={s.id}
                                  size="sm"
                                  variant="outline"
                                  onClick={() => addBookFromQueue(book.id, s.id)}
                                  className="text-xs flex-col h-auto py-2"
                                >
                                  <s.icon className="w-4 h-4 mb-1" />
                                  {s.label}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {book.status === "added" && (
                        <div className="flex items-center gap-3 h-full">
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                          <span className="text-green-600">Added to library!</span>
                        </div>
                      )}

                      {book.status === "error" && (
                        <div className="flex items-center gap-3 h-full">
                          <AlertCircle className="w-5 h-5 text-red-500" />
                          <span className="text-red-600">{book.error}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <Button
                  variant="outline"
                  onClick={() => setQueue([])}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Upload another photo
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* Bulk Import Mode */}
        {mode === "bulk" && (
          <motion.div
            key="bulk"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 max-w-4xl mx-auto w-full"
          >
            {queue.length === 0 ? (
              <div 
                onClick={() => bulkInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-16 rounded-3xl border-2 border-dashed border-border/50 hover:border-primary/50 transition-colors cursor-pointer bg-muted/20"
              >
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <ImagePlus className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">Upload Multiple Book Covers</h3>
                <p className="text-muted-foreground text-center max-w-sm">
                  Select multiple images to import your books in batch
                </p>
                <input
                  ref={bulkInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleBulkUpload}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Progress Bar */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-4">
                    <div className="text-sm">
                      <span className="font-medium">{queue.filter(b => b.status === "added").length}</span>
                      <span className="text-muted-foreground"> of {queue.length} added</span>
                    </div>
                    <div className="h-2 w-48 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all"
                        style={{ width: `${(queue.filter(b => b.status === "added").length / queue.length) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {queue.some(b => b.status === "pending") && (
                      <Button
                        onClick={processQueue}
                        disabled={isProcessing}
                        size="sm"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Zap className="w-4 h-4 mr-2" />
                        )}
                        Process All
                      </Button>
                    )}
                    {queue.some(b => b.status === "identified") && (
                      <Button
                        onClick={addAllIdentified}
                        variant="outline"
                        size="sm"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add All Identified
                      </Button>
                    )}
                  </div>
                </div>

                {/* Queue Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {queue.map((book) => (
                    <div 
                      key={book.id} 
                      className={cn(
                        "relative rounded-xl overflow-hidden border transition-all",
                        book.status === "added" && "border-green-500/50 bg-green-500/5",
                        book.status === "error" && "border-red-500/50 bg-red-500/5",
                        book.status === "identifying" && "border-primary/50",
                        (book.status === "pending" || book.status === "identified") && "border-border/50"
                      )}
                    >
                      <div className="aspect-[2/3] relative">
                        <img
                          src={book.preview}
                          alt="Book cover"
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Status overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          {book.status === "pending" && (
                            <span className="text-xs text-white/70">Pending</span>
                          )}
                          {book.status === "identifying" && (
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-3 h-3 animate-spin text-white" />
                              <span className="text-xs text-white">Identifying...</span>
                            </div>
                          )}
                          {book.status === "identified" && book.bookData && (
                            <div>
                              <p className="text-sm font-medium text-white truncate">{book.bookData.title}</p>
                              <p className="text-xs text-white/70 truncate">{book.bookData.author}</p>
                            </div>
                          )}
                          {book.status === "added" && (
                            <div className="flex items-center gap-1 text-green-400">
                              <CheckCircle2 className="w-3 h-3" />
                              <span className="text-xs">Added</span>
                            </div>
                          )}
                          {book.status === "error" && (
                            <div className="flex items-center gap-1 text-red-400">
                              <AlertCircle className="w-3 h-3" />
                              <span className="text-xs">{book.error}</span>
                            </div>
                          )}
                        </div>

                        {/* Remove button */}
                        <button
                          onClick={() => removeFromQueue(book.id)}
                          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>

                      {/* Quick add button for identified books */}
                      {book.status === "identified" && (
                        <div className="p-2 bg-muted/50">
                          <Button
                            size="sm"
                            onClick={() => addBookFromQueue(book.id, "want_to_read")}
                            className="w-full h-7 text-xs"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Add more button */}
                  <button
                    onClick={() => bulkInputRef.current?.click()}
                    className="aspect-[2/3] rounded-xl border-2 border-dashed border-border/50 hover:border-primary/50 flex flex-col items-center justify-center gap-2 transition-colors"
                  >
                    <Plus className="w-8 h-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Add more</span>
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
