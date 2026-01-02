"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldGroup,
} from "@/components/ui/field"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

import { VisibilityFormValues, visibilityFormSchema } from "@/lib/schemas/settings"
import { useSettings, useUpdateSettings } from "@/hooks/queries/use-settings"
import { useEffect } from "react"

export function VisibilityForm() {
  const { data: settings } = useSettings()
  const updateSettings = useUpdateSettings()

  const form = useForm<VisibilityFormValues>({
    resolver: zodResolver(visibilityFormSchema),
    defaultValues: {
      showProgressPublicly: false,
      showGoalsPublicly: false,
      defaultBookVisibility: "private",
      recommendations_enabled: false,
    },
  })

  useEffect(() => {
    if (settings) {
      const values: any = {}
      Object.keys(visibilityFormSchema.shape).forEach(key => {
        if (settings[key] !== undefined) {
          values[key] = settings[key]
        }
      })
      if (Object.keys(values).length > 0) {
        form.reset({ ...form.getValues(), ...values })
      }
    }
  }, [settings, form])

  async function onSubmit(data: VisibilityFormValues) {
    updateSettings.mutate({ category: "visibility", data })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visibility & Privacy</CardTitle>
        <CardDescription>
          Control what information is visible to the public.
        </CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <FieldGroup>
            <Field orientation="horizontal">
              <div className="flex flex-col gap-1.5 flex-1">
                <FieldLabel htmlFor="showProgressPublicly">Public Reading Progress</FieldLabel>
                <FieldDescription>
                  Allow visitors to see how far you've read in each book.
                </FieldDescription>
              </div>
              <Checkbox
                id="showProgressPublicly"
                checked={form.watch("showProgressPublicly")}
                onCheckedChange={(checked) => form.setValue("showProgressPublicly", !!checked)}
              />
            </Field>

            <Field orientation="horizontal">
              <div className="flex flex-col gap-1.5 flex-1">
                <FieldLabel htmlFor="showGoalsPublicly">Public Reading Goals</FieldLabel>
                <FieldDescription>
                  Show your reading goals and current progress to the public.
                </FieldDescription>
              </div>
              <Checkbox
                id="showGoalsPublicly"
                checked={form.watch("showGoalsPublicly")}
                onCheckedChange={(checked) => form.setValue("showGoalsPublicly", !!checked)}
              />
            </Field>

            <Field orientation="horizontal">
              <div className="flex flex-col gap-1.5 flex-1">
                <FieldLabel htmlFor="recommendations_enabled">Public Recommendations</FieldLabel>
                <FieldDescription>
                  Allow visitors to suggest books for you to read.
                </FieldDescription>
              </div>
              <Checkbox
                id="recommendations_enabled"
                checked={form.watch("recommendations_enabled")}
                onCheckedChange={(checked) => form.setValue("recommendations_enabled", !!checked)}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="defaultBookVisibility">Default Book Visibility</FieldLabel>
              <select
                id="defaultBookVisibility"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                {...form.register("defaultBookVisibility")}
              >
                <option value="private">Private (Default)</option>
                <option value="public">Public</option>
              </select>
              <FieldDescription>
                Initial visibility setting for newly added books.
              </FieldDescription>
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button type="submit" disabled={updateSettings.isPending}>
            {updateSettings.isPending ? "Saving..." : "Save Visibility Settings"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
