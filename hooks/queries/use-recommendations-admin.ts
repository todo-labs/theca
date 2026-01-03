import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const adminRecommendationKeys = {
  all: ["admin", "recommendations"] as const,
};

interface RecommendationsResponse {
  user: any[];
  ai: any[];
}

export function useAdminRecommendations() {
  return useQuery<RecommendationsResponse>({
    queryKey: adminRecommendationKeys.all,
    queryFn: async () => {
      const res = await fetch("/api/admin/recommendations");
      if (!res.ok) throw new Error("Failed to fetch recommendations");
      return res.json();
    },
  });
}

export function useUpdateRecommendationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, type }: { id: number; status: string; type: "ai" | "user" }) => {
      const endpoint = type === "ai" 
        ? `/api/admin/recommendations/ai/${id}/${status}` 
        : `/api/admin/recommendations/user/${id}/${status}`;
      
      const res = await fetch(endpoint, { method: "POST" });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminRecommendationKeys.all });
    },
  });
}
