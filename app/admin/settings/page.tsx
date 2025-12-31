"use client"

import { useState } from "react"
import { 
  User, 
  Brain, 
  Eye, 
  Bell, 
  Target, 
  Download 
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ProfileForm } from "@/components/forms/settings/profile-form"
import { AISettingsForm } from "@/components/forms/settings/ai-settings-form"
import { VisibilityForm } from "@/components/forms/settings/visibility-form"
import { NotificationForm } from "@/components/forms/settings/notification-form"
import { ReadingGoalsForm } from "@/components/forms/settings/reading-goals-form"
import { ExportSettingsForm } from "@/components/forms/settings/export-settings-form"

const sections = [
  {
    id: "profile",
    title: "Profile",
    icon: User,
  },
  {
    id: "ai",
    title: "AI Configuration",
    icon: Brain,
  },
  {
    id: "visibility",
    title: "Visibility",
    icon: Eye,
  },
  {
    id: "notifications",
    title: "Notifications",
    icon: Bell,
  },
  {
    id: "goals",
    title: "Reading Goals",
    icon: Target,
  },
  {
    id: "export",
    title: "Data Export",
    icon: Download,
  },
]

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile")

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col gap-1 mb-8">
        <h2 className="text-3xl font-serif font-medium tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and set your preferences.
        </p>
      </div>
      
      <Separator className="mb-8 opacity-50" />

      <div className="flex flex-col lg:flex-row gap-12">
        <aside className="lg:w-1/4">
          <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide">
            {sections.map((section) => (
              <Button
                key={section.id}
                variant="ghost"
                className={cn(
                  "justify-start gap-3 h-11 px-4 text-[11px] font-bold tracking-[0.15em] uppercase transition-all whitespace-nowrap",
                  activeSection === section.id 
                    ? "bg-primary/5 text-primary" 
                    : "text-muted-foreground/60 hover:text-foreground"
                )}
                onClick={() => setActiveSection(section.id)}
              >
                <section.icon className={cn("h-4 w-4", activeSection === section.id ? "text-primary" : "text-muted-foreground/40")} />
                {section.title}
              </Button>
            ))}
          </nav>
        </aside>

        <div className="flex-1">
          {activeSection === "profile" && <ProfileForm />}
          {activeSection === "ai" && <AISettingsForm />}
          {activeSection === "visibility" && <VisibilityForm />}
          {activeSection === "notifications" && <NotificationForm />}
          {activeSection === "goals" && <ReadingGoalsForm />}
          {activeSection === "export" && <ExportSettingsForm />}
        </div>
      </div>
    </div>
  )
}
