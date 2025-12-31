"use client"

import { Download } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldGroup,
} from "@/components/ui/field"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useState } from "react"

export function ExportSettingsForm() {
  const [includeHistory, setIncludeHistory] = useState(true)
  const [includeNotes, setIncludeNotes] = useState(true)

  const handleExport = (format: "json" | "csv") => {
    toast.info(`Exporting as ${format.toUpperCase()}...`)
    // Implementation for export would go here
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Export</CardTitle>
        <CardDescription>
          Download your library data for backups or use in other applications.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FieldGroup>
          <Field orientation="horizontal">
            <div className="flex flex-col gap-1.5 flex-1">
              <FieldLabel htmlFor="includeHistory">Include Reading History</FieldLabel>
              <FieldDescription>
                Include every progress entry for your books.
              </FieldDescription>
            </div>
            <Checkbox
              id="includeHistory"
              checked={includeHistory}
              onCheckedChange={(checked) => setIncludeHistory(!!checked)}
            />
          </Field>

          <Field orientation="horizontal">
            <div className="flex flex-col gap-1.5 flex-1">
              <FieldLabel htmlFor="includeNotes">Include Personal Notes</FieldLabel>
              <FieldDescription>
                Include your personal reviews and journal entries.
              </FieldDescription>
            </div>
            <Checkbox
              id="includeNotes"
              checked={includeNotes}
              onCheckedChange={(checked) => setIncludeNotes(!!checked)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <Button variant="outline" className="gap-2" onClick={() => handleExport("json")}>
              <Download className="h-4 w-4" />
              Export JSON
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => handleExport("csv")}>
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
