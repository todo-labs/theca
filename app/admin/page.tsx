"use client";

import { useAnalytics } from "@/hooks/queries/use-analytics";
import { MonthlyActivityChart } from "@/components/admin/monthly-activity-chart";
import { ReadingGoalsProgress } from "@/components/admin/reading-goals-progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function AdminDashboardPage() {
  const { data, isLoading, isError } = useAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold mb-6 tracking-tight">Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-sm" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[400px] lg:col-span-2 rounded-sm" />
          <Skeleton className="h-[400px] rounded-sm" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <h3 className="text-lg font-medium">Failed to load analytics</h3>
        <p className="text-muted-foreground mt-2">Please try again later.</p>
      </div>
    );
  }

  const { stats, monthly, goals } = data || { stats: {}, monthly: [], goals: [] };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6 tracking-tight">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-sm border-border hover:border-border/80 transition-shadow shadow-sm p-8">
          <h3 className="text-[11px] font-medium tracking-[0.15em] uppercase text-muted-foreground/70">
            Total Books
          </h3>
          <p className="text-4xl font-bold mt-4 tracking-tight">{stats.totalBooks || 0}</p>
        </Card>

        <Card className="rounded-sm border-border hover:border-border/80 transition-shadow shadow-sm p-8">
          <h3 className="text-[11px] font-medium tracking-[0.15em] uppercase text-muted-foreground/70">
            Currently Reading
          </h3>
          <p className="text-4xl font-bold mt-4 tracking-tight">{stats.currentlyReading || 0}</p>
        </Card>

        <Card className="rounded-sm border-border hover:border-border/80 transition-shadow shadow-sm p-8">
          <h3 className="text-[11px] font-medium tracking-[0.15em] uppercase text-muted-foreground/70">
            Pages Read
          </h3>
          <p className="text-4xl font-bold mt-4 tracking-tight">{stats.totalPagesRead || 0}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MonthlyActivityChart data={monthly} />
        <ReadingGoalsProgress goals={goals} />
      </div>
    </div>
  );
}
