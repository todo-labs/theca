import { useMutation, useQueryClient } from "@tanstack/react-query";

export const recommendationKeys = {
  all: ["recommendations"] as const,
};

export function useSubmitRecommendation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { title: string; author?: string; note?: string }) => {
      const res = await fetch("/api/recommendations/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to submit recommendation");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recommendationKeys.all });
    },
  });
}
