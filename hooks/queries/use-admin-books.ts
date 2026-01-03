import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bookKeys } from "./use-books";

export function useCreateBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/admin/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to add book");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookKeys.all });
    },
  });
}

export function useFetchBookDetails() {
  return useMutation({
    mutationFn: async (params: { query?: string; title?: string; author?: string }) => {
      const res = await fetch("/api/admin/books/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error("Failed to fetch book details");
      return res.json();
    },
  });
}

export function useUploadCover() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to upload cover image");
      return res.json();
    },
  });
}
