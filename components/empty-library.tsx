"use client"

import { BookOpen, Sparkles, Library, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/lib/stores/auth-store"

export function EmptyLibrary() {
  const { isAuthenticated } = useAuthStore()

  return (
    <div className="col-span-full flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-6 py-12">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/3 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-2xl text-center space-y-8">
        {/* Icon Stack */}
        <div className="relative mx-auto w-32 h-32">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl rotate-6 transition-transform hover:rotate-12" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 to-primary/5 rounded-3xl -rotate-6 transition-transform hover:-rotate-12" />
          <div className="relative flex items-center justify-center w-full h-full bg-background border border-border/50 rounded-3xl shadow-2xl">
            <Library className="w-12 h-12 text-primary/70" strokeWidth={1.5} />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight text-foreground">
            Your Library Awaits
          </h1>
          <p className="text-lg text-muted-foreground/80 max-w-lg mx-auto leading-relaxed">
            Begin your reading journey by adding your first book. Track your progress, 
            take notes, and discover new recommendations.
          </p>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full text-sm text-muted-foreground">
            <BookOpen className="w-4 h-4 text-primary/70" />
            <span>Track Progress</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 text-primary/70" />
            <span>AI Recommendations</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          {isAuthenticated ? (
            <Button asChild size="lg" className="group px-8 py-6 text-base font-medium">
              <Link href="/admin/books">
                Add Your First Book
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild size="lg" className="group px-8 py-6 text-base font-medium">
                <Link href="/admin/login">
                  Get Started
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <p className="text-sm text-muted-foreground/60">
                Login to start building your library
              </p>
            </>
          )}
        </div>

        {/* Decorative Quote */}
        <div className="pt-12 border-t border-border/20 mt-12">
          <blockquote className="text-muted-foreground/50 italic text-sm max-w-md mx-auto">
            "A reader lives a thousand lives before he dies. The man who never reads lives only one."
          </blockquote>
          <cite className="block mt-2 text-xs text-muted-foreground/40 not-italic">
            — George R.R. Martin
          </cite>
        </div>
      </div>
    </div>
  )
}
