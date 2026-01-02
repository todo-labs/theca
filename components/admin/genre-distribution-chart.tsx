"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = ["#818cf8", "#c084fc", "#f472b6", "#fb7185", "#fb923c", "#facc15", "#4ade80", "#2dd4bf"];

interface GenreDistributionChartProps {
  data: Array<{ genre: string; count: number }>;
}

export function GenreDistributionChart({ data }: GenreDistributionChartProps) {
  return (
    <Card className="col-span-1 rounded-sm border-border/25">
      <CardHeader>
        <CardTitle className="text-sm font-bold tracking-wider uppercase">Genre Distribution</CardTitle>
        <CardDescription>Breakdown of your library by genre</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="count"
                nameKey="genre"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                itemStyle={{ color: 'var(--foreground)' }}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
