"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Check,
  Loader2,
  BookOpen,
  Upload,
  Trash2,
  Save,
  ImagePlus,
} from "lucide-react";
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
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bookKeys } from "@/hooks/queries/use-books";
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
  };
  trigger: React.ReactNode;
  onSuccess?: () => void;
}

export function EditBookModal({ book, trigger, onSuccess }: EditBookModalProps) {
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
  });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
      queryClient.invalidateQueries({ queryKey: bookKeys.all });
      toast.success("Book updated successfully!");
      setOpen(false);
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setFormData((prev) => ({ ...prev, coverImageUrl: data.url }));
      toast.success("Cover image uploaded!");
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

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
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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
          {/* Cover Image */}
          <div className="flex gap-6">
            <div className="shrink-0">
              <div
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "w-28 aspect-[2/3] rounded-lg overflow-hidden border-2 border-dashed cursor-pointer transition-all",
                  "hover:border-primary/50 flex items-center justify-center bg-muted",
                  formData.coverImageUrl && "border-solid border-border"
                )}
              >
                {formData.coverImageUrl ? (
                  <img
                    src={formData.coverImageUrl}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                ) : isUploading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                ) : (
                  <div className="text-center p-2">
                    <ImagePlus className="w-6 h-6 mx-auto text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground mt-1 block">
                      Upload Cover
                    </span>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                className="hidden"
              />
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
              <label className="text-sm font-medium">Publication Year</label>
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
          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <label className="text-sm font-medium">Cover Image URL</label>
              <Input
                name="coverImageUrl"
                value={formData.coverImageUrl}
                onChange={handleChange}
                placeholder="https://..."
                className="mt-1"
              />
            </div>
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

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateBook.isPending}>
              {updateBook.isPending ? (
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
