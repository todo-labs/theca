import { useQuery } from "@tanstack/react-query";

export const analyticsKeys = {
  all: ["analytics"] as const,
};

interface AnalyticsData {
  stats: {
    totalBooks: number;
    currentlyReading: number;
    totalPagesRead: number;
  };
  monthly: Array<{ month: string; pages: number }>;
  genres: Array<{ genre: string; count: number }>;
  goals: any[];
  activity: any[];
}

export function useAnalytics() {
  return useQuery<AnalyticsData>({
    queryKey: analyticsKeys.all,
    queryFn: async () => {
      const res = await fetch("/api/analytics");
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
  });
}
