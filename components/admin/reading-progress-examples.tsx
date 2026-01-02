// Example: How to integrate ReadingProgressChart with real API data

import { ReadingProgressChart } from "@/components/admin/reading-progress-chart"
import { useEffect, useState } from "react"

interface ReadingDay {
  date: Date
  pagesRead: number
  books: string[]
}

export function ReadingProgressWithAPI() {
  const [data, setData] = useState<ReadingDay[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchReadingData() {
      try {
        // Replace with your actual API endpoint
        const response = await fetch('/api/reading-progress')
        const rawData = await response.json()
        
        // Transform API data to ReadingDay format
        const transformedData: ReadingDay[] = rawData.map((item: any) => ({
          date: new Date(item.date),
          pagesRead: item.pages_read,
          books: item.book_titles || []
        }))
        
        setData(transformedData)
      } catch (error) {
        console.error('Failed to fetch reading data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReadingData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-muted-foreground">Loading reading data...</div>
      </div>
    )
  }

  return <ReadingProgressChart data={data} />
}

// Example API Response Format:
/*
[
  {
    "date": "2024-01-01T00:00:00Z",
    "pages_read": 45,
    "book_titles": ["The Great Gatsby", "1984"]
  },
  {
    "date": "2024-01-02T00:00:00Z",
    "pages_read": 32,
    "book_titles": ["1984"]
  },
  ...
]
*/

// Example: Filtering by user
export function UserReadingProgress({ userId }: { userId: string }) {
  const [data, setData] = useState<ReadingDay[]>([])

  useEffect(() => {
    async function fetchUserData() {
      const response = await fetch(`/api/users/${userId}/reading-progress`)
      const rawData = await response.json()
      
      const transformedData: ReadingDay[] = rawData.map((item: any) => ({
        date: new Date(item.date),
        pagesRead: item.pages_read,
        books: item.book_titles || []
      }))
      
      setData(transformedData)
    }

    fetchUserData()
  }, [userId])

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Reading Progress for User {userId}</h2>
      <ReadingProgressChart data={data} />
    </div>
  )
}

// Example: With date range selector
export function ReadingProgressWithDateRange() {
  const [startDate, setStartDate] = useState(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000))
  const [endDate, setEndDate] = useState(new Date())
  const [data, setData] = useState<ReadingDay[]>([])

  useEffect(() => {
    async function fetchData() {
      const response = await fetch(
        `/api/reading-progress?start=${startDate.toISOString()}&end=${endDate.toISOString()}`
      )
      const rawData = await response.json()
      
      const transformedData: ReadingDay[] = rawData.map((item: any) => ({
        date: new Date(item.date),
        pagesRead: item.pages_read,
        books: item.book_titles || []
      }))
      
      setData(transformedData)
    }

    fetchData()
  }, [startDate, endDate])

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div>
          <label className="text-sm font-medium">Start Date</label>
          <input
            type="date"
            value={startDate.toISOString().split('T')[0]}
            onChange={(e) => setStartDate(new Date(e.target.value))}
            className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2"
          />
        </div>
        <div>
          <label className="text-sm font-medium">End Date</label>
          <input
            type="date"
            value={endDate.toISOString().split('T')[0]}
            onChange={(e) => setEndDate(new Date(e.target.value))}
            className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2"
          />
        </div>
      </div>
      
      <ReadingProgressChart data={data} />
    </div>
  )
}
