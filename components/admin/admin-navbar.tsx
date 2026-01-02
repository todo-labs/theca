"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useLogout } from "@/hooks/queries/use-auth"

interface NavItem {
  label: string
  href: string
  segment: string
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/admin", segment: "" },
  { label: "Books", href: "/admin/books", segment: "books" },
  { label: "Reading Progress", href: "/admin/reading-progress", segment: "reading-progress" },
  { label: "Recommendations", href: "/admin/recommendations", segment: "recommendations" },
  { label: "Reports", href: "/admin/reports", segment: "reports" },
  { label: "Settings", href: "/admin/settings", segment: "settings" },
]

export function AdminNavbar() {
  const pathname = usePathname()
  const logout = useLogout()

  const handleLogout = () => {
    logout.mutate()
  }

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
            disabled={logout.isPending}
          >
            {logout.isPending ? "Logging out..." : "Logout"}
          </Button>
        </div>
      </div>
    </header>
  )
}
