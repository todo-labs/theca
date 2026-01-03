"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ReadingVelocityChartProps {
  data: Array<{ date: Date; pages: number }>;
}

function formatDate(date: Date): string {
  const d = new Date(date);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

export function ReadingVelocityChart({ data }: ReadingVelocityChartProps) {
  const formattedData = data.map((item) => ({
    ...item,
    dateStr: formatDate(new Date(item.date)),
  }));

  if (data.length === 0) {
    return (
      <Card className="col-span-full rounded-sm border-border/25">
        <CardHeader>
          <CardTitle className="text-sm font-bold tracking-wider uppercase">Reading Velocity</CardTitle>
          <CardDescription>Pages read per day over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No reading activity in the last 30 days
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full rounded-sm border-border/25">
      <CardHeader>
        <CardTitle className="text-sm font-bold tracking-wider uppercase">Reading Velocity</CardTitle>
        <CardDescription>Pages read per day over the last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData}>
              <defs>
                <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis 
                dataKey="dateStr" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: '#666' }}
                interval="preserveStartEnd"
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#666' }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                itemStyle={{ color: 'var(--foreground)' }}
                formatter={(value: number) => [value, 'Pages']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Area 
                type="monotone" 
                dataKey="pages" 
                stroke="#818cf8" 
                strokeWidth={2}
                fill="url(#velocityGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
