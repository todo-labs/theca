"use client";

import { useState } from "react";
import {
  Search,
  Sparkles,
  Check,
  ArrowRight,
  BookOpen,
  ArrowLeft,
  RotateCcw,
  Zap,
  PauseCircle,
  XCircle,
  Gift,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useCreateBook } from "@/hooks/queries/use-admin-books";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface SmartBookOnboardingProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

type Step = "input" | "searching" | "confirm" | "status";

export function SmartBookOnboarding({
  trigger,
  onSuccess,
}: SmartBookOnboardingProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("input");
  const [query, setQuery] = useState("");
  const [bookDetails, setBookDetails] = useState<any>(null);
  const [readingStatus, setReadingStatus] = useState("to_read");

  const createBook = useCreateBook();

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setStep("searching");

    try {
      const res = await fetch("/api/admin/books/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      });

      if (!res.ok) {
        throw new Error("Failed to fetch book details");
      }

      const data = await res.json();
      setBookDetails(data);
      setStep("confirm");
    } catch (error: any) {
      toast.error(error.message || "Could not find book details");
      setStep("input");
    }
  };

  const handleConfirm = async () => {
    setStep("status");
  };

  const handleFinalSubmit = async (status: string) => {
    try {
      const isWishlist = status === "wishlist";
      await createBook.mutateAsync({
        ...bookDetails,
        readingStatus: isWishlist ? "to_read" : status,
        isWishlist,
      });

      toast.success(isWishlist ? "Book added to your wishlist!" : "Book added to your library!");
      reset();
      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to add book");
    }
  };

  const reset = () => {
    setStep("input");
    setQuery("");
    setBookDetails(null);
    setReadingStatus("to_read");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>
        {trigger || (
          <Button className="flex items-center gap-2 px-6 h-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/20">
            <Sparkles className="w-4 h-4" />
            <span className="font-medium">Add Book with AI</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none bg-background/80 backdrop-blur-xl">
        <div className="relative p-8">
          <AnimatePresence mode="wait">
            {step === "input" && (
              <motion.div
                key="input"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="space-y-2 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 mb-2">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <DialogTitle className="text-2xl font-serif">
                    What are you reading?
                  </DialogTitle>
                  <DialogDescription>
                    Just type the title, author, or ISBN. Our AI will handle the
                    rest.
                  </DialogDescription>
                </div>

                <form onSubmit={handleSearch} className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Search className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  </div>
                  <Input
                    autoFocus
                    placeholder="The Great Gatsby..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-12 h-14 text-lg rounded-2xl bg-muted/50 border-border/50 focus:ring-primary/20 transition-all"
                  />
                  <Button
                    type="submit"
                    disabled={!query.trim()}
                    className="absolute right-2 top-2 h-10 w-10 rounded-xl p-0"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </form>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span className="text-xs text-muted-foreground">Try:</span>
                  {[
                    "Tomorrow and Tomorrow",
                    "Atomic Habits",
                    "978-0743273565",
                  ].map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setQuery(t);
                      }}
                      className="text-xs px-2 py-1 rounded-md bg-muted hover:bg-muted/80 transition-colors"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === "searching" && (
              <motion.div
                key="searching"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="flex flex-col items-center justify-center py-12 space-y-8"
              >
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-24 h-24 rounded-full border-2 border-dashed border-primary/30"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-primary animate-pulse" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-serif">Identifying "{query}"</h3>
                  <p className="text-sm text-muted-foreground animate-pulse">
                    Scanning Google Books & Exa for metadata...
                  </p>
                </div>
                <div className="flex gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
                </div>
              </motion.div>
            )}

            {step === "confirm" && bookDetails && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex gap-6">
                  <div className="shrink-0">
                    <div className="relative w-28 aspect-[2/3] rounded-lg overflow-hidden shadow-xl border border-border/50 bg-muted">
                      {bookDetails.coverImageUrl ? (
                        <img
                          src={bookDetails.coverImageUrl}
                          alt={bookDetails.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-8 h-8 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="text-[10px] font-bold tracking-widest uppercase text-primary/70">
                      Discovery Found
                    </div>
                    <h3 className="text-2xl font-serif leading-tight">
                      {bookDetails.title}
                    </h3>
                    {bookDetails.subtitle && (
                      <p className="text-sm text-muted-foreground italic">
                        {bookDetails.subtitle}
                      </p>
                    )}
                    <p className="text-md text-foreground/80 mt-2">
                      {bookDetails.author}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-4">
                      {bookDetails.genre && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold uppercase tracking-wider">
                          {bookDetails.genre}
                        </span>
                      )}
                      {bookDetails.publicationYear && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-bold uppercase tracking-wider">
                          {bookDetails.publicationYear}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 p-4 rounded-xl bg-muted/30 border border-border/40">
                  <h4 className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
                    About the Book
                  </h4>
                  <p className="text-xs text-muted-foreground/80 line-clamp-4 leading-relaxed">
                    {bookDetails.description ||
                      "No description available for this edition."}
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setStep("input")}
                    className="flex-1 rounded-xl h-12"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Wrong book?
                  </Button>
                  <Button
                    onClick={handleConfirm}
                    className="flex-1 rounded-xl h-12 bg-primary shadow-lg shadow-primary/20"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Yes, that's it
                  </Button>
                </div>
              </motion.div>
            )}

            {step === "status" && (
              <motion.div
                key="status"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                <div className="space-y-2 text-center">
                  <DialogTitle className="text-2xl font-serif">
                    Almost there!
                  </DialogTitle>
                  <DialogDescription>
                    What's your current progress with this book?
                  </DialogDescription>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      id: "to_read",
                      label: "Want to Read",
                      icon: BookOpen,
                    },
                    {
                      id: "in_progress",
                      label: "Reading",
                      icon: RotateCcw,
                    },
                    { id: "read", label: "Finished", icon: Check },
                    { id: "paused", label: "Paused", icon: PauseCircle },
                    { id: "dnf", label: "Did Not Finish", icon: XCircle },
                    { id: "wishlist", label: "Wishlist", icon: Gift },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleFinalSubmit(s.id)}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-2xl border transition-all hover:border-primary group",
                        readingStatus === s.id
                          ? "bg-primary/5 border-primary shadow-sm"
                          : "bg-muted/30 border-border/50",
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                            readingStatus === s.id
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
                          )}
                        >
                          <s.icon className="w-5 h-5" />
                        </div>
                        <span className="font-medium">{s.label}</span>
                      </div>
                      <Zap
                        className={cn(
                          "w-4 h-4 transition-opacity",
                          readingStatus === s.id
                            ? "opacity-100 text-primary"
                            : "opacity-0",
                        )}
                      />
                    </button>
                  ))}
                </div>

                <Button
                  variant="ghost"
                  onClick={() => setStep("confirm")}
                  className="w-full rounded-xl text-muted-foreground"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to book details
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
