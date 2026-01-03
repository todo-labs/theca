import { useQuery } from "@tanstack/react-query";

export interface ReportsData {
  genres: Array<{ genre: string; count: number }>;
  booksByStatus: Array<{ status: string; count: number }>;
  readingVelocity: Array<{ date: Date; pages: number }>;
  weeklyComparison: {
    currentWeekPages: number;
    lastWeekPages: number;
    percentChange: number;
  };
  insights: {
    totalBooks: number;
    completedBooks: number;
    completionRate: number;
    avgPagesPerSession: number;
    topGenre: string;
    currentStreak: number;
  };
  monthly: Array<{ month: string; pages: number }>;
}

export const reportsKeys = {
  all: ["reports"] as const,
};

export function useReports() {
  return useQuery<ReportsData>({
    queryKey: reportsKeys.all,
    queryFn: async () => {
      const res = await fetch("/api/reports");
      if (!res.ok) throw new Error("Failed to fetch reports");
      return res.json();
    },
  });
}
