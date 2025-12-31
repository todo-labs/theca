"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/lib/stores/auth-store"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

interface NavItem {
  label: string
  href: string
  segment: string
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/admin", segment: "" },
  { label: "Books", href: "/admin/books", segment: "books" },
  { label: "Library", href: "/admin/library", segment: "library" },
  { label: "Reading Progress", href: "/admin/reading-progress", segment: "reading-progress" },
  { label: "User Recommendations", href: "/admin/user-recommendations", segment: "user-recommendations" },
  { label: "AI Recommendations", href: "/admin/ai-recommendations", segment: "ai-recommendations" },
  { label: "Reports", href: "/admin/reports", segment: "reports" },
  { label: "Settings", href: "/admin/settings", segment: "settings" },
]

export function AdminNavbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { setAuthenticated } = useAuthStore()

  const handleLogout = async () => {
    await fetch("/api/auth", { method: "DELETE" })
    setAuthenticated(false)
    router.push("/admin/login")
  }

  // Extract the segment after /admin/
  const currentSegment = pathname.split("/admin/")[1] || ""

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/30">
      <div className="flex h-16 items-center justify-between px-8 lg:px-16">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="text-[11px] font-bold tracking-[0.25em] uppercase">theca</span>
            <span className="text-[10px] font-medium tracking-wide text-muted-foreground/50">Admin</span>
          </Link>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = currentSegment === item.segment
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-[11px] font-medium tracking-[0.15em] uppercase px-4 py-2 rounded-sm transition-colors",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground/50 hover:text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-transparent hover:text-primary px-3 py-1 ml-2"
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}
