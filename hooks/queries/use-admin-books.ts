import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Book } from "@/lib/domain/books";

export const adminBookKeys = {
  all: ["admin", "books"] as const,
  lists: () => [...adminBookKeys.all, "list"] as const,
  list: () => [...adminBookKeys.lists()] as const,
  details: () => [...adminBookKeys.all, "detail"] as const,
  detail: (id: string) => [...adminBookKeys.details(), id] as const,
};

export function useAdminBooks() {
  return useQuery<Book[]>({
    queryKey: adminBookKeys.list(),
    queryFn: async () => {
      const res = await fetch("/api/admin/books", {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch books");
      return res.json();
    },
  });
}

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
        throw new Error(error.error || "Failed to create book");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminBookKeys.all });
    },
  });
}

export function useAdminBook(id: string) {
  return useQuery<Book>({
    queryKey: adminBookKeys.detail(id),
    queryFn: async () => {
      const res = await fetch(`/api/admin/books/${id}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch book");
      return res.json();
    },
  });
}

export function useUpdateAdminBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/admin/books/${id}`, {
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
    },
  });
}

export function useDeleteAdminBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/books/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete book");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminBookKeys.all });
    },
  });
}

export function useUpdateBookProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/admin/books/${id}/progress`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update progress");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminBookKeys.all });
    },
  });
}
