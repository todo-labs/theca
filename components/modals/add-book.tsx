"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Sparkles } from "lucide-react";
import { useCreateBook } from "@/hooks/queries/use-admin-books";
import { useCreateWishlistItem } from "@/hooks/queries/use-wishlist";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  author: z.string().min(1, "Author is required"),
  isbn: z.string().optional(),
  genre: z.string().optional(),
  publicationYear: z
    .number()
    .int()
    .min(1000)
    .max(2100)
    .optional()
    .or(z.literal("")),
  publisher: z.string().optional(),
  pageCount: z.number().int().positive().optional().or(z.literal("")),
  description: z.string().optional(),
  readingStatus: z.enum(["to_read", "in_progress", "read", "paused", "dnf"]),
  isWishlist: z.boolean(),
  wishlistPriority: z.number().min(1).max(5).optional(),
  purchaseUrl: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddBookModalProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function AddBookModal({ trigger, onSuccess }: AddBookModalProps) {
  const [open, setOpen] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const createBook = useCreateBook();
  const createWishlistItem = useCreateWishlistItem();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      author: "",
      isbn: "",
      genre: "",
      publicationYear: "",
      publisher: "",
      pageCount: "",
      description: "",
      readingStatus: "to_read",
      isWishlist: false,
      wishlistPriority: undefined,
      purchaseUrl: "",
    },
  });

  const isWishlist = form.watch("isWishlist");

  const fetchBookDetails = async () => {
    toast.info("Auto-fill feature coming soon!");
  };

  async function onSubmit(values: FormValues) {
    try {
      if (values.isWishlist) {
        await createWishlistItem.mutateAsync({
          title: values.title,
          subtitle: values.subtitle || undefined,
          author: values.author,
          isbn: values.isbn || undefined,
          genre: values.genre || undefined,
          publicationYear: values.publicationYear
            ? Number(values.publicationYear)
            : undefined,
          publisher: values.publisher || undefined,
          pageCount: values.pageCount ? Number(values.pageCount) : undefined,
          description: values.description || undefined,
          coverImageUrl: coverPreview || undefined,
          wishlistPriority: values.wishlistPriority,
          purchaseUrl: values.purchaseUrl || undefined,
        });
      } else {
        await createBook.mutateAsync({
          title: values.title,
          subtitle: values.subtitle || null,
          author: values.author,
          isbn: values.isbn || null,
          genre: values.genre || null,
          publicationYear: values.publicationYear
            ? Number(values.publicationYear)
            : null,
          publisher: values.publisher || null,
          pageCount: values.pageCount ? Number(values.pageCount) : null,
          description: values.description || null,
          coverImageUrl: coverPreview || null,
          readingStatus: values.readingStatus,
        });
      }

      toast.success(
        values.isWishlist ? "Added to wishlist!" : "Book added successfully!",
      );
      form.reset({
        title: "",
        subtitle: "",
        author: "",
        isbn: "",
        genre: "",
        publicationYear: "",
        publisher: "",
        pageCount: "",
        description: "",
        readingStatus: "to_read",
        isWishlist: false,
        wishlistPriority: undefined,
        purchaseUrl: "",
      });
      setCoverPreview(null);
      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong. Please try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Book
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            Add New Book
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enter the book details below. Use the AI button to auto-fill from
            book databases.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pt-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
                  Cover Image URL
                </label>
                <div className="flex items-center gap-4">
                  {coverPreview && (
                    <div className="w-20 h-30 rounded overflow-hidden border border-border/40">
                      <img
                        src={coverPreview}
                        alt="Cover preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      type="url"
                      placeholder="https://example.com/cover.jpg"
                      value={coverPreview || ""}
                      onChange={(e) => setCoverPreview(e.target.value)}
                      className="bg-muted/30 border-border/40"
                    />
                  </div>
                </div>
              </div>

              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
                        Title *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="The Great Gatsby"
                          {...field}
                          className="bg-muted/30 border-border/40"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="subtitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
                        Subtitle
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="A Novel"
                          {...field}
                          className="bg-muted/30 border-border/40"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="author"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
                        Author *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="F. Scott Fitzgerald"
                          {...field}
                          className="bg-muted/30 border-border/40"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={fetchBookDetails}
                  disabled={false}
                  className="w-full flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] uppercase"
                >
                  <Sparkles className="w-4 h-4" />
                  Auto-Fill with AI
                </Button>
              </div>

              <div>
                <FormField
                  control={form.control}
                  name="isbn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
                        ISBN
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="978-0743273565"
                          {...field}
                          className="bg-muted/30 border-border/40"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <FormField
                  control={form.control}
                  name="genre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
                        Genre
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-muted/30 border-border/40">
                            <SelectValue placeholder="Select a genre" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="fiction">Fiction</SelectItem>
                          <SelectItem value="non-fiction">
                            Non-Fiction
                          </SelectItem>
                          <SelectItem value="mystery">Mystery</SelectItem>
                          <SelectItem value="thriller">Thriller</SelectItem>
                          <SelectItem value="romance">Romance</SelectItem>
                          <SelectItem value="science-fiction">
                            Science Fiction
                          </SelectItem>
                          <SelectItem value="fantasy">Fantasy</SelectItem>
                          <SelectItem value="horror">Horror</SelectItem>
                          <SelectItem value="biography">Biography</SelectItem>
                          <SelectItem value="history">History</SelectItem>
                          <SelectItem value="self-help">Self-Help</SelectItem>
                          <SelectItem value="business">Business</SelectItem>
                          <SelectItem value="science">Science</SelectItem>
                          <SelectItem value="poetry">Poetry</SelectItem>
                          <SelectItem value="drama">Drama</SelectItem>
                          <SelectItem value="classic">Classic</SelectItem>
                          <SelectItem value="young-adult">
                            Young Adult
                          </SelectItem>
                          <SelectItem value="children">Children</SelectItem>
                          <SelectItem value="graphic-novel">
                            Graphic Novel
                          </SelectItem>
                          <SelectItem value="crime">Crime</SelectItem>
                          <SelectItem value="adventure">Adventure</SelectItem>
                          <SelectItem value="contemporary">
                            Contemporary
                          </SelectItem>
                          <SelectItem value="historical-fiction">
                            Historical Fiction
                          </SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <FormField
                  control={form.control}
                  name="publicationYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
                        Publication Year
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="1925"
                          {...field}
                          value={field.value}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value),
                            )
                          }
                          className="bg-muted/30 border-border/40"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <FormField
                  control={form.control}
                  name="pageCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
                        Page Count
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="180"
                          {...field}
                          value={field.value}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value),
                            )
                          }
                          className="bg-muted/30 border-border/40"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="publisher"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
                        Publisher
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Scribner"
                          {...field}
                          className="bg-muted/30 border-border/40"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="isWishlist"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="isWishlist"
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <label
                            htmlFor="isWishlist"
                            className="text-sm font-medium text-foreground"
                          >
                            Add to Wishlist
                          </label>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {!isWishlist && (
                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name="readingStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
                          Reading Status
                        </FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="w-full px-3 py-2 rounded-md bg-muted/30 border border-border/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                          >
                            <option value="to_read">Want to Read</option>
                            <option value="in_progress">Reading</option>
                            <option value="read">Finished</option>
                            <option value="paused">Paused</option>
                            <option value="dnf">Did Not Finish</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {isWishlist && (
                <>
                  <div>
                    <FormField
                      control={form.control}
                      name="wishlistPriority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
                            Priority (1-5)
                          </FormLabel>
                          <FormControl>
                            <select
                              {...field}
                              value={field.value || ""}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value
                                    ? Number(e.target.value)
                                    : undefined,
                                )
                              }
                              className="w-full px-3 py-2 rounded-md bg-muted/30 border border-border/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            >
                              <option value="">Select Priority</option>
                              <option value="1">1 - Low</option>
                              <option value="2">2</option>
                              <option value="3">3 - Medium</option>
                              <option value="4">4</option>
                              <option value="5">5 - High</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name="purchaseUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
                            Purchase URL (optional)
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://google.com/books/..."
                              {...field}
                              className="bg-muted/30 border-border/40"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}

              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
                        Description
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="A brief description of the book..."
                          className="resize-none min-h-[120px] bg-muted/30 border-border/40"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="text-[11px] font-bold tracking-[0.2em] uppercase"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createBook.isPending || createWishlistItem.isPending}
                className="text-[11px] font-bold tracking-[0.2em] uppercase"
              >
                {createBook.isPending || createWishlistItem.isPending
                  ? "Adding..."
                  : isWishlist
                    ? "Add to Wishlist"
                    : "Add Book"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
