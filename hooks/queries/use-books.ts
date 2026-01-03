import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Book {
  id: number;
  title: string;
  author: string;
  coverImageUrl: string | null;
  readingStatus: string;
  description: string | null;
  publisher: string | null;
  publicationYear: number | null;
  pageCount: number | null;
  isbn: string | null;
  currentPage?: number;
}

export const bookKeys = {
  all: ["books"] as const,
  lists: () => [...bookKeys.all, "list"] as const,
  list: (filters: string) => [...bookKeys.lists(), { filters }] as const,
  details: () => [...bookKeys.all, "detail"] as const,
  detail: (id: number) => [...bookKeys.details(), id] as const,
};

export function useBooks() {
  return useQuery<Book[]>({
    queryKey: bookKeys.lists(),
    queryFn: async () => {
      const res = await fetch("/api/books");
      if (!res.ok) throw new Error("Failed to fetch books");
      return res.json();
    },
  });
}

export function useUpdateBookProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      currentPage,
      readingStatus,
    }: {
      id: number;
      currentPage?: number;
      readingStatus?: string;
    }) => {
      const res = await fetch(`/api/admin/books/${id}/progress`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPage, readingStatus }),
      });
      if (!res.ok) throw new Error("Failed to update progress");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookKeys.all });
    },
  });
}
