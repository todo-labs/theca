"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const STATUS_COLORS: Record<string, string> = {
  read: "#4ade80",
  in_progress: "#818cf8",
  to_read: "#facc15",
  paused: "#fb923c",
  dnf: "#f87171",
  unknown: "#64748b",
};

const STATUS_LABELS: Record<string, string> = {
  read: "Finished",
  in_progress: "Reading",
  to_read: "Want to Read",
  paused: "Paused",
  dnf: "Did Not Finish",
  unknown: "Unknown",
};

interface BooksByStatusChartProps {
  data: Array<{ status: string; count: number }>;
}

export function BooksByStatusChart({ data }: BooksByStatusChartProps) {
  const formattedData = data.map((item) => ({
    ...item,
    label: STATUS_LABELS[item.status] || item.status,
  }));

  if (data.length === 0) {
    return (
      <Card className="rounded-sm border-border/25">
        <CardHeader>
          <CardTitle className="text-sm font-bold tracking-wider uppercase">
            Books by Status
          </CardTitle>
          <CardDescription>
            Distribution of your books by reading status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-sm border-border/25">
      <CardHeader>
        <CardTitle className="text-sm font-bold tracking-wider uppercase">
          Books by Status
        </CardTitle>
        <CardDescription>
          Distribution of your books by reading status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedData} layout="vertical">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#333"
                horizontal={false}
              />
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#666" }}
              />
              <YAxis
                type="category"
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#888" }}
                width={100}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
                contentStyle={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                }}
                itemStyle={{ color: "var(--foreground)" }}
                formatter={(value: number) => [value, "Books"]}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {formattedData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={STATUS_COLORS[entry.status] || STATUS_COLORS.unknown}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
