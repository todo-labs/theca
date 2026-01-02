import { useQuery } from "@tanstack/react-query";

export const analyticsKeys = {
  all: ["analytics"] as const,
};

export function useAnalytics() {
  return useQuery({
    queryKey: analyticsKeys.all,
    queryFn: async () => {
      const res = await fetch("/api/analytics");
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
  });
}
