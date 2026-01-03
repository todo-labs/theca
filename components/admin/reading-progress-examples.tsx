// NOTE: These example components use the /api/analytics endpoint for reading data.
// See app/api/analytics/route.ts for the actual implementation.

import { ReadingProgressChart } from "@/components/admin/reading-progress-chart";
import { useEffect, useState } from "react";

interface ReadingDay {
  date: Date;
  pagesRead: number;
  books: string[];
}

export function ReadingProgressWithAPI() {
  const [data, setData] = useState<ReadingDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReadingData() {
      try {
        const response = await fetch("/api/analytics");
        const rawData = await response.json();

        const activity = rawData.activity || [];
        const transformedData: ReadingDay[] = activity.map((item: any) => ({
          date: new Date(item.date),
          pagesRead: item.pagesRead || item.pages_read,
          books: item.books || [],
        }));

        setData(transformedData);
      } catch (error) {
        console.error("Failed to fetch reading data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchReadingData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-muted-foreground">Loading reading data...</div>
      </div>
    );
  }

  return <ReadingProgressChart data={data} />;
}

// Example API Response Format:
/*
[
  {
    "date": "2024-01-01T00:00:00Z",
    "pagesRead": 45,
    "bookTitles": ["The Great Gatsby", "1984"]
  },
  {
    "date": "2024-01-02T00:00:00Z",
    "pagesRead": 32,
    "bookTitles": ["1984"]
  },
  ...
]
*/

// Example: With date range selector
export function ReadingProgressWithDateRange() {
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
  );
  const [endDate, setEndDate] = useState(new Date());
  const [data, setData] = useState<ReadingDay[]>([]);

  useEffect(() => {
    async function fetchData() {
      const response = await fetch(
        `/api/analytics?start=${startDate.toISOString()}&end=${endDate.toISOString()}`,
      );
      const rawData = await response.json();

      const activity = rawData.activity || [];
      const transformedData: ReadingDay[] = activity.map((item: any) => ({
        date: new Date(item.date),
        pagesRead: item.pagesRead || item.pages_read,
        books: item.books || [],
      }));

      setData(transformedData);
    }

    fetchData();
  }, [startDate, endDate]);

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div>
          <label className="text-sm font-medium">Start Date</label>
          <input
            type="date"
            value={startDate.toISOString().split("T")[0]}
            onChange={(e) => setStartDate(new Date(e.target.value))}
            className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2"
          />
        </div>
        <div>
          <label className="text-sm font-medium">End Date</label>
          <input
            type="date"
            value={endDate.toISOString().split("T")[0]}
            onChange={(e) => setEndDate(new Date(e.target.value))}
            className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2"
          />
        </div>
      </div>

      <ReadingProgressChart data={data} />
    </div>
  );
}
