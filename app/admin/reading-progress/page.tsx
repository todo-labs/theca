"use client";

import { ReadingProgressChart } from "@/components/admin/reading-progress-chart"
import { useAnalytics } from "@/hooks/queries/use-analytics"
import { Skeleton } from "@/components/ui/skeleton"

export default function ReadingProgressPage() {
  const { data, isLoading } = useAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="border-b border-border/30 pb-6">
          <h1 className="text-4xl font-serif font-bold tracking-tight mb-3">Reading Progress</h1>
          <p className="text-sm text-muted-foreground">Track and visualize your reading activity over time</p>
        </div>
        <Skeleton className="h-[500px] w-full rounded-sm" />
      </div>
    );
  }

  const { activity } = data || { activity: [] };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-border/30 pb-6">
        <h1 className="text-4xl font-serif font-bold tracking-tight mb-3">Reading Progress</h1>
        <p className="text-sm text-muted-foreground">Track and visualize your reading activity over time</p>
      </div>

      {/* Chart */}
      <ReadingProgressChart data={activity} />
    </div>
  )
}
