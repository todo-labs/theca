import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/30">
      <div className="flex h-16 items-center justify-between px-8 lg:px-16">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold tracking-[0.25em] uppercase">theca</span>
        </div>
        <nav className="hidden md:block">
          <span className="text-[11px] font-medium tracking-wide text-muted-foreground/70">Book Listing</span>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" className="text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-transparent hover:text-primary px-0 ml-2">
            Login
          </Button>
        </div>
      </div>
    </header>
  )
}
