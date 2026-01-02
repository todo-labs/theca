"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ReadingGoal {
  id: number;
  goalType: string;
  targetValue: number;
  currentProgress: number;
  periodEnd: string | Date;
}

interface ReadingGoalsProgressProps {
  goals: ReadingGoal[];
}

export function ReadingGoalsProgress({ goals }: ReadingGoalsProgressProps) {
  if (!goals || goals.length === 0) {
    return (
      <Card className="rounded-sm border-border/25">
        <CardHeader>
          <CardTitle className="text-sm font-bold tracking-wider uppercase">Active Goals</CardTitle>
          <CardDescription>No active reading goals set</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground italic">You haven't set any reading goals yet. Go to settings to get started.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-sm border-border/25">
      <CardHeader>
        <CardTitle className="text-sm font-bold tracking-wider uppercase">Active Goals</CardTitle>
        <CardDescription>Your progress toward current targets</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {goals.map((goal) => {
          const percentage = Math.min(Math.round((goal.currentProgress / goal.targetValue) * 100), 100);
          const label = goal.goalType.replace(/_/g, " ");
          
          return (
            <div key={goal.id} className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
                  {label}
                </span>
                <span className="text-xs font-medium">
                  {goal.currentProgress} / {goal.targetValue}
                </span>
              </div>
              <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500" 
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] text-muted-foreground">
                  {percentage}% complete
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Ends {new Date(goal.periodEnd).toLocaleDateString()}
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
