"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface MonthlyActivityChartProps {
  data: Array<{ month: string; pages: number }>;
}

export function MonthlyActivityChart({ data }: MonthlyActivityChartProps) {
  return (
    <Card className="col-span-full lg:col-span-2 rounded-sm border-border/25">
      <CardHeader>
        <CardTitle className="text-sm font-bold tracking-wider uppercase">Monthly Reading Activity</CardTitle>
        <CardDescription>Pages read per month over the last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#666' }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#666' }}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                itemStyle={{ color: 'var(--foreground)' }}
              />
              <Bar dataKey="pages" fill="#818cf8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
