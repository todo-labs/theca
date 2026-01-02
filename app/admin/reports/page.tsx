"use client";

import { useAnalytics } from "@/hooks/queries/use-analytics";
import { ReadingProgressChart } from "@/components/admin/reading-progress-chart";
import { GenreDistributionChart } from "@/components/admin/genre-distribution-chart";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReportsPage() {
  const { data, isLoading } = useAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-2 tracking-tight">Reports</h2>
          <p className="text-muted-foreground text-sm">Detailed visualization of your reading habits</p>
        </div>
        <Skeleton className="h-[400px] w-full rounded-sm" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[400px] lg:col-span-2 rounded-sm" />
          <Skeleton className="h-[400px] rounded-sm" />
        </div>
      </div>
    );
  }

  const { genres, activity } = data || { genres: [], activity: [] };

  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-2xl font-bold mb-2 tracking-tight">Reports</h2>
        <p className="text-muted-foreground text-sm">Detailed visualization of your reading habits and library composition</p>
      </div>

      <section>
        <ReadingProgressChart data={activity} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GenreDistributionChart data={genres} />
        {/* We can add more report-specific components here later */}
      </section>
    </div>
  );
}
