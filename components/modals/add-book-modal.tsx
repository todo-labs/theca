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
import { Plus, Upload, Sparkles } from "lucide-react";

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
  readingStatus: z.enum([
    "want_to_read",
    "currently_reading",
    "completed",
    "on_hold",
    "did_not_finish",
  ]),
});

type FormValues = z.infer<typeof formSchema>;

interface AddBookModalProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

import { useCreateBook, useFetchBookDetails, useUploadCover } from "@/hooks/queries/use-admin-books";

export function AddBookModal({ trigger, onSuccess }: AddBookModalProps) {
  const [open, setOpen] = useState(false);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const createBook = useCreateBook();
  const fetchDetails = useFetchBookDetails();
  const uploadCover = useUploadCover();

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
      readingStatus: "want_to_read",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const fetchBookDetails = async () => {
    const title = form.getValues("title");
    const author = form.getValues("author");

    if (!title || !author) {
      toast.error("Please enter both title and author");
      return;
    }

    try {
      const data = await fetchDetails.mutateAsync({ title, author });

      form.setValue("subtitle", data.subtitle || "");
      form.setValue("isbn", data.isbn || "");
      form.setValue("genre", data.genre || "");
      form.setValue("publicationYear", data.publicationYear || "");
      form.setValue("publisher", data.publisher || "");
      form.setValue("pageCount", data.pageCount || "");
      form.setValue("description", data.description || "");

      if (data.coverImageUrl) {
        setCoverPreview(data.coverImageUrl);
      }

      toast.success("Book details fetched successfully!");
    } catch (error) {
      toast.error("Failed to fetch book details. Please try again.");
    }
  };

  async function onSubmit(values: FormValues) {
    try {
      let coverImageUrl = null;
      let coverImagePath = null;
      let coverImageHash = null;

      if (coverImage) {
        const uploadData = await uploadCover.mutateAsync(coverImage);
        coverImageUrl = uploadData.url;
        coverImagePath = uploadData.path;
        coverImageHash = uploadData.hash;
      }

      await createBook.mutateAsync({
        ...values,
        publicationYear: values.publicationYear
          ? Number(values.publicationYear)
          : null,
        pageCount: values.pageCount ? Number(values.pageCount) : null,
        coverImageUrl,
        coverImagePath,
        coverImageHash,
      });

      toast.success("Book added successfully!");
      form.reset();
      setCoverImage(null);
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
            Upload a cover image and enter the book details below.
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
                  Cover Image
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
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border/40 rounded-lg cursor-pointer hover:border-primary/50 transition-colors bg-muted/20">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-6 h-6 mb-2 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          Click to upload cover
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </label>
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
                  disabled={fetchDetails.isPending}
                  className="w-full flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] uppercase"
                >
                  <Sparkles className="w-4 h-4" />
                  {fetchDetails.isPending ? "Fetching Details..." : "Auto-Fill with AI"}
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
                          <option value="want_to_read">Want to Read</option>
                          <option value="currently_reading">
                            Currently Reading
                          </option>
                          <option value="completed">Completed</option>
                          <option value="on_hold">On Hold</option>
                          <option value="did_not_finish">Did Not Finish</option>
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
                disabled={createBook.isPending || uploadCover.isPending}
                className="text-[11px] font-bold tracking-[0.2em] uppercase"
              >
                {createBook.isPending || uploadCover.isPending ? "Adding..." : "Add Book"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
