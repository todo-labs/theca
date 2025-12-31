"use client"

import Link from "next/link"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuthStore } from "@/lib/stores/auth-store"

export function Header() {
  const { isAuthenticated, setAuthenticated } = useAuthStore()

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
    checkAuth()
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
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost" className="text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-transparent hover:text-primary px-3 py-1 ml-2">
            <Link href={isAuthenticated ? "/admin" : "/admin/login"}>
              {isAuthenticated ? "Dashboard" : "Login"}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
