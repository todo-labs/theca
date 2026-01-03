import { z } from "zod";

export const PeriodSchema = z.enum(["week", "month", "quarter", "year"]);

export const TimeRangeSchema = z.object({
  start: z.string().or(z.date()),
  end: z.string().or(z.date()),
});

export type Period = z.infer<typeof PeriodSchema>;
export type TimeRange = z.infer<typeof TimeRangeSchema>;
