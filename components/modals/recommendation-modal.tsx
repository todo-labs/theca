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
import { PlusCircle } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(1, "Book title is required"),
  author: z.string().optional(),
  note: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface RecommendationModalProps {
  trigger?: React.ReactNode;
}

import { useSubmitRecommendation } from "@/hooks/queries/use-recommendations";

export function RecommendationModal({ trigger }: RecommendationModalProps) {
  const [open, setOpen] = useState(false);
  const submitRecommendation = useSubmitRecommendation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      author: "",
      note: "",
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      await submitRecommendation.mutateAsync(values);
      toast.success("Recommendation submitted successfully!");
      form.reset();
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Something went wrong. Please try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            className="flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-transparent hover:text-primary"
          >
            <PlusCircle className="w-4 h-4" />
            Suggest a Book
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Suggest a Book</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Found something you think I should read? Let me know below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
                    Title *
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="The Great Gatsby" {...field} className="bg-muted/30 border-border/40" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="author"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
                    Author
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="F. Scott Fitzgerald" {...field} className="bg-muted/30 border-border/40" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
                    Why should I read this?
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell me a bit about it..."
                      className="resize-none min-h-[100px] bg-muted/30 border-border/40"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={submitRecommendation.isPending}
                className="w-full text-[11px] font-bold tracking-[0.2em] uppercase"
              >
                {submitRecommendation.isPending ? "Submitting..." : "Submit Recommendation"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
