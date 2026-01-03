import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const wishlistKeys = {
  all: ["wishlist"] as const,
};

export function useWishlist() {
  return useQuery({
    queryKey: wishlistKeys.all,
    queryFn: async () => {
      const res = await fetch("/api/wishlist");
      if (!res.ok) throw new Error("Failed to fetch wishlist");
      return res.json();
    },
  });
}

export function useCreateWishlistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      subtitle?: string;
      author: string;
      isbn?: string;
      genre?: string;
      publicationYear?: number;
      publisher?: string;
      pageCount?: number;
      description?: string;
      coverImageUrl?: string;
      wishlistPriority?: number;
      purchaseUrl?: string;
    }) => {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to add to wishlist");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wishlistKeys.all });
      toast.success("Added to wishlist");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useAcquireBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: number;
      status?: "to_read" | "in_progress";
    }) => {
      const res = await fetch(`/api/wishlist/${id}/acquire`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: status || "to_read" }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to acquire book");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wishlistKeys.all });
      toast.success("Book acquired! Moved to your library.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateWishlistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: {
        wishlistPriority?: number;
        purchaseUrl?: string;
      };
    }) => {
      const res = await fetch(`/api/wishlist/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update wishlist item");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wishlistKeys.all });
      toast.success("Wishlist item updated");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
