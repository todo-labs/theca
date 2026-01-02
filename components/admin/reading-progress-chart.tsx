"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BookOpen, TrendingUp, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

interface ReadingDay {
  date: Date
  pagesRead: number
  books: string[]
}

interface ReadingProgressChartProps {
  data?: ReadingDay[]
  className?: string
}

// Empty state component
function EmptyReadingProgress() {
  return (
    <div className="space-y-6">
      {/* Stats Summary - Empty State */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border/30 rounded-lg p-4">
          <div className="text-2xl font-bold font-serif text-muted-foreground/50">0</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Total Pages</div>
        </div>
        <div className="bg-card border border-border/30 rounded-lg p-4">
          <div className="text-2xl font-bold font-serif text-muted-foreground/50">0</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Active Days</div>
        </div>
        <div className="bg-card border border-border/30 rounded-lg p-4">
          <div className="text-2xl font-bold font-serif text-muted-foreground/50">0</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Day Streak</div>
        </div>
      </div>

      {/* Empty Chart State */}
      <div className="bg-card border border-border/30 rounded-lg p-8">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          {/* Decorative Icon */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-primary/10 rounded-2xl blur-xl" />
            <div className="relative p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/20">
              <TrendingUp className="w-8 h-8 text-primary/60" strokeWidth={1.5} />
            </div>
          </div>

          {/* Message */}
          <h3 className="text-lg font-medium text-foreground mb-2">
            No Reading Activity Yet
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mb-6">
            Start tracking your reading progress to see your activity visualized here. 
            Log pages read to build your streak and watch your reading habits grow.
          </p>

          {/* How to get started */}
          <div className="flex flex-wrap justify-center gap-4 text-xs">
            <div className="flex items-center gap-2 px-4 py-2 bg-muted/30 rounded-full text-muted-foreground">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Add books to your library</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-muted/30 rounded-full text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <span>Log daily reading sessions</span>
            </div>
          </div>

          {/* Placeholder Chart Preview */}
          <div className="mt-8 opacity-30">
            <div className="flex gap-1">
              {Array.from({ length: 20 }).map((_, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {Array.from({ length: 7 }).map((_, dayIndex) => (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className="w-[10px] h-[10px] rounded-sm bg-muted/50"
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ReadingProgressChart({ 
  data,
  className 
}: ReadingProgressChartProps) {
  const [hoveredDay, setHoveredDay] = useState<ReadingDay | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  // Check if we have actual reading data
  const hasData = data && data.length > 0 && data.some(d => d.pagesRead > 0)

  // If no data, show empty state
  if (!hasData) {
    return (
      <div className={cn("w-full", className)}>
        <EmptyReadingProgress />
      </div>
    )
  }

  // We now know data is defined and has content
  const readingData = data as ReadingDay[]

  // Group data by weeks
  const weeks: ReadingDay[][] = []
  let currentWeek: ReadingDay[] = []
  
  // Pad the beginning to start on Sunday
  const firstDay = readingData[0].date.getDay()
  for (let i = 0; i < firstDay; i++) {
    currentWeek.push({ date: new Date(0), pagesRead: 0, books: [] })
  }
  
  readingData.forEach((day) => {
    currentWeek.push(day)
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  })
  
  // Add remaining days
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push({ date: new Date(0), pagesRead: 0, books: [] })
    }
    weeks.push(currentWeek)
  }

  // Calculate intensity levels (0-4)
  const maxPages = Math.max(...readingData.map(d => d.pagesRead))
  const getIntensity = (pagesRead: number): number => {
    if (pagesRead === 0) return 0
    if (pagesRead < maxPages * 0.25) return 1
    if (pagesRead < maxPages * 0.5) return 2
    if (pagesRead < maxPages * 0.75) return 3
    return 4
  }

  const getColor = (intensity: number): string => {
    const colors = {
      0: "bg-muted/30",
      1: "bg-primary/30",
      2: "bg-primary/50",
      3: "bg-primary/70",
      4: "bg-primary"
    }
    return colors[intensity as keyof typeof colors] || colors[0]
  }

  const handleMouseEnter = (day: ReadingDay, event: React.MouseEvent) => {
    if (day.date.getTime() === 0) return
    setHoveredDay(day)
    const rect = (event.target as HTMLElement).getBoundingClientRect()
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    })
  }

  const handleMouseLeave = () => {
    setHoveredDay(null)
  }

  // Get month labels
  const monthLabels: { label: string; weekIndex: number }[] = []
  let lastMonth = -1
  weeks.forEach((week, weekIndex) => {
    const firstValidDay = week.find(d => d.date.getTime() !== 0)
    if (firstValidDay) {
      const month = firstValidDay.date.getMonth()
      if (month !== lastMonth && weekIndex > 0) {
        monthLabels.push({
          label: firstValidDay.date.toLocaleDateString('en-US', { month: 'short' }),
          weekIndex
        })
        lastMonth = month
      }
    }
  })

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Calculate total stats
  const totalPages = readingData.reduce((sum, day) => sum + day.pagesRead, 0)
  const activeDays = readingData.filter(day => day.pagesRead > 0).length
  const currentStreak = calculateStreak(readingData)

  return (
    <div className={cn("w-full", className)}>
      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border/30 rounded-lg p-4">
          <div className="text-2xl font-bold font-serif">{totalPages.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Total Pages</div>
        </div>
        <div className="bg-card border border-border/30 rounded-lg p-4">
          <div className="text-2xl font-bold font-serif">{activeDays}</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Active Days</div>
        </div>
        <div className="bg-card border border-border/30 rounded-lg p-4">
          <div className="text-2xl font-bold font-serif">{currentStreak}</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Day Streak</div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="bg-card border border-border/30 rounded-lg p-6">
        <div className="mb-4">
          <h3 className="text-sm font-bold tracking-wider uppercase text-foreground">Reading Activity</h3>
          <p className="text-xs text-muted-foreground mt-1">Last 365 days</p>
        </div>

        <div className="overflow-x-auto custom-scrollbar pb-2">
          <div className="inline-block min-w-full">
            {/* Month labels */}
            <div className="flex mb-2 ml-8">
              {monthLabels.map((month, index) => (
                <div
                  key={index}
                  className="text-[10px] text-muted-foreground uppercase tracking-wide"
                  style={{ 
                    marginLeft: index === 0 ? `${month.weekIndex * 14}px` : `${(month.weekIndex - monthLabels[index - 1].weekIndex) * 14}px` 
                  }}
                >
                  {month.label}
                </div>
              ))}
            </div>

            {/* Chart Grid */}
            <div className="flex gap-1">
              {/* Day labels */}
              <div className="flex flex-col gap-1 pr-2">
                {dayLabels.map((label, index) => (
                  <div
                    key={label}
                    className={cn(
                      "text-[9px] text-muted-foreground uppercase tracking-wide h-[10px] flex items-center",
                      index % 2 === 1 && "opacity-0"
                    )}
                  >
                    {label}
                  </div>
                ))}
              </div>

              {/* Weeks */}
              <div className="flex gap-1">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {week.map((day, dayIndex) => {
                      const intensity = getIntensity(day.pagesRead)
                      const isPlaceholder = day.date.getTime() === 0
                      
                      return (
                        <motion.div
                          key={`${weekIndex}-${dayIndex}`}
                          className={cn(
                            "w-[10px] h-[10px] rounded-sm transition-all cursor-pointer",
                            isPlaceholder ? "opacity-0 pointer-events-none" : getColor(intensity),
                            "hover:ring-2 hover:ring-primary hover:ring-offset-1 hover:ring-offset-background"
                          )}
                          onMouseEnter={(e) => handleMouseEnter(day, e)}
                          onMouseLeave={handleMouseLeave}
                          whileHover={{ scale: 1.3 }}
                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        />
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 mt-4 ml-8">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Less</span>
              {[0, 1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={cn("w-[10px] h-[10px] rounded-sm", getColor(level))}
                />
              ))}
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">More</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {hoveredDay && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="fixed z-50 pointer-events-none"
            style={{
              left: tooltipPosition.x,
              top: tooltipPosition.y,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <div className="bg-popover border border-border shadow-lg rounded-md px-3 py-2 text-xs">
              <div className="font-bold">
                {hoveredDay.pagesRead} {hoveredDay.pagesRead === 1 ? 'page' : 'pages'}
              </div>
              <div className="text-muted-foreground text-[10px] mt-0.5">
                {hoveredDay.date.toLocaleDateString('en-US', { 
                  weekday: 'short',
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
              {hoveredDay.books.length > 0 && (
                <div className="text-muted-foreground text-[10px] mt-1 border-t border-border/30 pt-1">
                  {hoveredDay.books.length} {hoveredDay.books.length === 1 ? 'book' : 'books'}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Calculate current reading streak
function calculateStreak(data: ReadingDay[]): number {
  let streak = 0
  const sortedData = [...data].reverse()
  
  for (const day of sortedData) {
    if (day.pagesRead > 0) {
      streak++
    } else {
      break
    }
  }
  
  return streak
}
