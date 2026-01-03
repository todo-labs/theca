"use client";

import { useReports } from "@/hooks/queries/use-reports";
import { InsightCards } from "@/components/admin/insight-cards";
import { ReadingVelocityChart } from "@/components/admin/reading-velocity-chart";
import { GenreDistributionChart } from "@/components/admin/genre-distribution-chart";
import { BooksByStatusChart } from "@/components/admin/books-by-status-chart";
import { MonthlyActivityChart } from "@/components/admin/monthly-activity-chart";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3 } from "lucide-react";

export default function ReportsPage() {
  const { data, isLoading, isError } = useReports();

  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="border-b border-border/30 pb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
              <BarChart3 className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold tracking-tight">Reports & Insights</h1>
              <p className="text-sm text-muted-foreground">Analytics and visualizations of your reading journey</p>
            </div>
          </div>
        </div>
        
        {/* Insight Cards Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-[130px] rounded-sm" />
          ))}
        </div>
        
        {/* Charts Skeleton */}
        <Skeleton className="h-[350px] w-full rounded-sm" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[350px] lg:col-span-2 rounded-sm" />
          <Skeleton className="h-[350px] rounded-sm" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <h3 className="text-lg font-medium">Failed to load reports</h3>
        <p className="text-muted-foreground mt-2">Please try again later.</p>
      </div>
    );
  }

  const { 
    genres = [], 
    booksByStatus = [], 
    readingVelocity = [], 
    weeklyComparison = { currentWeekPages: 0, lastWeekPages: 0, percentChange: 0 }, 
    insights = { totalBooks: 0, completedBooks: 0, completionRate: 0, avgPagesPerSession: 0, topGenre: 'N/A', currentStreak: 0 },
    monthly = [],
  } = data || {};

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="border-b border-border/30 pb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
            <BarChart3 className="h-6 w-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold tracking-tight">Reports & Insights</h1>
            <p className="text-sm text-muted-foreground">Analytics and visualizations of your reading journey</p>
          </div>
        </div>
      </div>

      {/* Insight Cards */}
      <section>
        <InsightCards insights={insights} weeklyComparison={weeklyComparison} />
      </section>

      {/* Reading Velocity Chart - Full Width */}
      <section>
        <ReadingVelocityChart data={readingVelocity} />
      </section>

      {/* Monthly Activity & Genre Distribution */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MonthlyActivityChart data={monthly} />
        <GenreDistributionChart data={genres} />
      </section>

      {/* Books by Status */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BooksByStatusChart data={booksByStatus} />
        
        {/* Additional insights card */}
        <div className="rounded-sm border border-border/25 p-6 bg-gradient-to-br from-background to-muted/5">
          <h3 className="text-sm font-bold tracking-wider uppercase mb-4">Reading Highlights</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border/20">
              <span className="text-sm text-muted-foreground">Books completed this month</span>
              <span className="text-lg font-semibold">{insights.completedBooks}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border/20">
              <span className="text-sm text-muted-foreground">Favorite genre</span>
              <span className="text-lg font-semibold">{insights.topGenre}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border/20">
              <span className="text-sm text-muted-foreground">Current reading streak</span>
              <span className="text-lg font-semibold">{insights.currentStreak} days</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-muted-foreground">Avg pages per session</span>
              <span className="text-lg font-semibold">{insights.avgPagesPerSession}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
