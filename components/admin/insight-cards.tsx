"use client";

import { TrendingUp, TrendingDown, Minus, BookOpen, Target, Flame, BookMarked, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface InsightCardsProps {
  insights: {
    totalBooks: number;
    completedBooks: number;
    completionRate: number;
    avgPagesPerSession: number;
    topGenre: string;
    currentStreak: number;
  };
  weeklyComparison: {
    currentWeekPages: number;
    lastWeekPages: number;
    percentChange: number;
  };
}

export function InsightCards({ insights, weeklyComparison }: InsightCardsProps) {
  const { percentChange, currentWeekPages } = weeklyComparison;
  
  const TrendIcon = percentChange > 0 ? TrendingUp : percentChange < 0 ? TrendingDown : Minus;
  const trendColor = percentChange > 0 ? "text-green-500" : percentChange < 0 ? "text-red-500" : "text-muted-foreground";
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {/* Weekly Progress */}
      <Card className="rounded-sm border-border shadow-sm bg-gradient-to-br from-indigo-500/10 to-transparent">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-md bg-indigo-500/20">
              <BarChart3 className="h-4 w-4 text-indigo-400" />
            </div>
          </div>
          <p className="text-[10px] font-medium tracking-[0.15em] uppercase text-muted-foreground/70 mb-1">
            This Week
          </p>
          <p className="text-2xl font-bold tracking-tight">{currentWeekPages}</p>
          <div className={`flex items-center gap-1 mt-1 ${trendColor}`}>
            <TrendIcon className="h-3 w-3" />
            <span className="text-xs font-medium">
              {percentChange > 0 ? "+" : ""}{percentChange}%
            </span>
          </div>
        </CardContent>
      </Card>
      
      {/* Reading Streak */}
      <Card className="rounded-sm border-border shadow-sm bg-gradient-to-br from-orange-500/10 to-transparent">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-md bg-orange-500/20">
              <Flame className="h-4 w-4 text-orange-400" />
            </div>
          </div>
          <p className="text-[10px] font-medium tracking-[0.15em] uppercase text-muted-foreground/70 mb-1">
            Streak
          </p>
          <p className="text-2xl font-bold tracking-tight">{insights.currentStreak}</p>
          <p className="text-xs text-muted-foreground mt-1">days</p>
        </CardContent>
      </Card>
      
      {/* Completion Rate */}
      <Card className="rounded-sm border-border shadow-sm bg-gradient-to-br from-green-500/10 to-transparent">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-md bg-green-500/20">
              <Target className="h-4 w-4 text-green-400" />
            </div>
          </div>
          <p className="text-[10px] font-medium tracking-[0.15em] uppercase text-muted-foreground/70 mb-1">
            Completion
          </p>
          <p className="text-2xl font-bold tracking-tight">{insights.completionRate}%</p>
          <p className="text-xs text-muted-foreground mt-1">{insights.completedBooks}/{insights.totalBooks} books</p>
        </CardContent>
      </Card>
      
      {/* Avg Pages */}
      <Card className="rounded-sm border-border shadow-sm bg-gradient-to-br from-purple-500/10 to-transparent">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-md bg-purple-500/20">
              <BookOpen className="h-4 w-4 text-purple-400" />
            </div>
          </div>
          <p className="text-[10px] font-medium tracking-[0.15em] uppercase text-muted-foreground/70 mb-1">
            Avg Session
          </p>
          <p className="text-2xl font-bold tracking-tight">{insights.avgPagesPerSession}</p>
          <p className="text-xs text-muted-foreground mt-1">pages</p>
        </CardContent>
      </Card>
      
      {/* Top Genre */}
      <Card className="rounded-sm border-border shadow-sm bg-gradient-to-br from-pink-500/10 to-transparent">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-md bg-pink-500/20">
              <BookMarked className="h-4 w-4 text-pink-400" />
            </div>
          </div>
          <p className="text-[10px] font-medium tracking-[0.15em] uppercase text-muted-foreground/70 mb-1">
            Top Genre
          </p>
          <p className="text-lg font-bold tracking-tight truncate" title={insights.topGenre}>
            {insights.topGenre}
          </p>
        </CardContent>
      </Card>
      
      {/* Total Books */}
      <Card className="rounded-sm border-border bg-gradient-to-br from-cyan-500/10 to-transparent shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-md bg-cyan-500/20">
              <BookOpen className="h-4 w-4 text-cyan-400" />
            </div>
          </div>
          <p className="text-[10px] font-medium tracking-[0.15em] uppercase text-muted-foreground/70 mb-1">
            Library
          </p>
          <p className="text-2xl font-bold tracking-tight">{insights.totalBooks}</p>
          <p className="text-xs text-muted-foreground mt-1">total books</p>
        </CardContent>
      </Card>
    </div>
  );
}
