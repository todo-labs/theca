"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuthStore } from "@/lib/stores/auth-store"
import { RecommendationModal } from "@/components/modals/recommendation-modal"

export function Header() {
  const { isAuthenticated, setAuthenticated } = useAuthStore()
  const [recommendationsEnabled, setRecommendationsEnabled] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth")
        const data = await response.json()
        setAuthenticated(data.isAuthenticated)
      } catch (error) {
        setAuthenticated(false)
      }
    }
    
    const checkRecommendationsStatus = async () => {
      try {
        const response = await fetch("/api/recommendations/status")
        const data = await response.json()
        setRecommendationsEnabled(data.enabled)
      } catch (error) {
        setRecommendationsEnabled(false)
      }
    }

    checkAuth()
    checkRecommendationsStatus()
  }, [setAuthenticated])

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/30">
      <div className="flex h-16 items-center justify-between px-8 lg:px-16">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold tracking-[0.25em] uppercase">theca</span>
        </div>
        <nav className="hidden md:block">
          <span className="text-[11px] font-medium tracking-wide text-muted-foreground/70">Library Management Software</span>
        </nav>
        <div className="flex items-center gap-4">
          {recommendationsEnabled && (
            <div className="hidden sm:block">
              <RecommendationModal />
            </div>
          )}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="ghost" className="text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-transparent hover:text-primary px-3 py-1 ml-2">
              <Link href={isAuthenticated ? "/admin" : "/admin/login"}>
                {isAuthenticated ? "Dashboard" : "Login"}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
