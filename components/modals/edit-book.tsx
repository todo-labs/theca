"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Save, ImagePlus, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminBookKeys } from "@/hooks/queries/use-admin-books";
import { wishlistKeys } from "@/hooks/queries/use-wishlist";
import {
  useAcquireBook,
  useUpdateWishlistItem,
} from "@/hooks/queries/use-wishlist";
import { cn } from "@/lib/utils";

interface EditBookModalProps {
  book: {
    id: number;
    title: string;
    subtitle?: string | null;
    author?: string | null;
    isbn?: string | null;
    genre?: string | null;
    publicationYear?: number | null;
    publisher?: string | null;
    pageCount?: number | null;
    description?: string | null;
    coverImageUrl?: string | null;
    readingStatus?: string;
    currentPage?: number;
    personalNotes?: string | null;
    isWishlist?: boolean;
    wishlistPriority?: number | null;
    purchaseUrl?: string | null;
  };
  trigger: React.ReactNode;
  onSuccess?: () => void;
}

export function EditBookModal({
  book,
  trigger,
  onSuccess,
}: EditBookModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: book.title,
    subtitle: book.subtitle || "",
    author: book.author || "",
    isbn: book.isbn || "",
    genre: book.genre || "",
    publicationYear: book.publicationYear || "",
    publisher: book.publisher || "",
    pageCount: book.pageCount || "",
    description: book.description || "",
    coverImageUrl: book.coverImageUrl || "",
    currentPage: book.currentPage || 0,
    personalNotes: book.personalNotes || "",
    isWishlist: book.isWishlist || false,
    wishlistPriority: book.wishlistPriority || undefined,
    purchaseUrl: book.purchaseUrl || "",
  });
  const queryClient = useQueryClient();

  const updateBook = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`/api/admin/books/${book.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update book");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminBookKeys.all });
      queryClient.invalidateQueries({ queryKey: wishlistKeys.all });
      toast.success("Book updated successfully!");
      setOpen(false);
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateWishlistItem = useUpdateWishlistItem();

  const acquireBook = useAcquireBook();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.isWishlist) {
      updateWishlistItem.mutate({
        id: book.id,
        data: {
          wishlistPriority: formData.wishlistPriority,
          purchaseUrl: formData.purchaseUrl || undefined,
        },
      });
    } else {
      updateBook.mutate({
        ...formData,
        publicationYear: formData.publicationYear
          ? parseInt(formData.publicationYear.toString())
          : null,
        pageCount: formData.pageCount
          ? parseInt(formData.pageCount.toString())
          : null,
        subtitle: formData.subtitle || null,
        isbn: formData.isbn || null,
        genre: formData.genre || null,
        publisher: formData.publisher || null,
        description: formData.description || null,
        coverImageUrl: formData.coverImageUrl || null,
        personalNotes: formData.personalNotes || null,
        isWishlist: formData.isWishlist,
      });
    }
  };

  const handleRemoveCover = () => {
    setFormData((prev) => ({ ...prev, coverImageUrl: "" }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAcquireBook = () => {
    acquireBook.mutate({ id: book.id, status: "to_read" });
    setFormData((prev) => ({ ...prev, isWishlist: false }));
    setOpen(false);
  };

  const isWishlist = formData.isWishlist;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Edit Book</DialogTitle>
          <DialogDescription>
            Update the details for "{book.title}"
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/40">
            <input
              type="checkbox"
              id="isWishlist"
              checked={isWishlist}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  isWishlist: e.target.checked,
                }))
              }
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label
              htmlFor="isWishlist"
              className="text-sm font-medium flex items-center gap-2"
            >
              <Gift className="w-4 h-4" />
              This is a wishlist item
            </label>
          </div>

          {isWishlist && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 p-4 rounded-lg bg-muted/20 border border-border/30"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Wishlist Details
                </h4>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={handleAcquireBook}
                  disabled={acquireBook.isPending}
                  className="text-[10px] font-bold tracking-[0.2em] uppercase"
                >
                  {acquireBook.isPending ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Gift className="w-3 h-3 mr-1" />
                  )}
                  Mark as Acquired
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select
                    value={String(formData.wishlistPriority || "")}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        wishlistPriority: value ? parseInt(value) : undefined,
                      }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Low</SelectItem>
                      <SelectItem value="2">2 - Medium</SelectItem>
                      <SelectItem value="3">3 - Normal</SelectItem>
                      <SelectItem value="4">4 - High</SelectItem>
                      <SelectItem value="5">5 - Very High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Purchase URL (optional)
                  </label>
                  <Input
                    name="purchaseUrl"
                    value={formData.purchaseUrl}
                    onChange={handleChange}
                    placeholder="https://google.com/books/..."
                    className="mt-1"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {!isWishlist && (
            <>
              {/* Cover Image */}
              <div className="flex gap-6">
                <div className="shrink-0">
                  <div
                    className={cn(
                      "w-28 aspect-[2/3] rounded-lg overflow-hidden border-2 border-dashed transition-all relative",
                      "hover:border-primary/50 flex items-center justify-center bg-muted",
                      formData.coverImageUrl && "border-solid border-border",
                    )}
                  >
                    {formData.coverImageUrl ? (
                      <img
                        src={formData.coverImageUrl}
                        alt="Cover"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-2">
                        <ImagePlus className="w-6 h-6 mx-auto text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground mt-1 block">
                          Cover URL
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="text-sm font-medium">Title *</label>
                    <Input
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Author</label>
                    <Input
                      name="author"
                      value={formData.author}
                      onChange={handleChange}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">
                      Cover Image URL
                    </label>
                    <Input
                      name="coverImageUrl"
                      value={formData.coverImageUrl}
                      onChange={handleChange}
                      placeholder="https://..."
                      className="mt-1"
                    />
                    {formData.coverImageUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveCover}
                        className="mt-2 text-xs text-muted-foreground hover:text-destructive"
                      >
                        Remove Cover
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Subtitle</label>
                  <Input
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleChange}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">ISBN</label>
                  <Input
                    name="isbn"
                    value={formData.isbn}
                    onChange={handleChange}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Genre</label>
                  <Input
                    name="genre"
                    value={formData.genre}
                    onChange={handleChange}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Publisher</label>
                  <Input
                    name="publisher"
                    value={formData.publisher}
                    onChange={handleChange}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Publication Year
                  </label>
                  <Input
                    name="publicationYear"
                    type="number"
                    value={formData.publicationYear}
                    onChange={handleChange}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Page Count</label>
                  <Input
                    name="pageCount"
                    type="number"
                    value={formData.pageCount}
                    onChange={handleChange}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1"
                />
              </div>

              {/* Progress */}
              <div>
                <label className="text-sm font-medium">Current Page</label>
                <Input
                  name="currentPage"
                  type="number"
                  value={formData.currentPage}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm font-medium">Personal Notes</label>
                <Textarea
                  name="personalNotes"
                  value={formData.personalNotes}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Your thoughts about this book..."
                  className="mt-1"
                />
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateBook.isPending || updateWishlistItem.isPending}
            >
              {updateBook.isPending || updateWishlistItem.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
