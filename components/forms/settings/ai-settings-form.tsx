"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
} from "@/components/ui/field"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

import { AISettingsFormValues, aiSettingsFormSchema } from "@/lib/schemas/settings"
import { useSettings, useUpdateSettings } from "@/hooks/queries/use-settings"
import { useEffect } from "react"

export function AISettingsForm() {
  const { data: settings } = useSettings()
  const updateSettings = useUpdateSettings()

  const form = useForm<AISettingsFormValues>({
    resolver: zodResolver(aiSettingsFormSchema),
    defaultValues: {
      enableDiscovery: true,
      refreshFrequency: "daily",
      maxSuggestions: 10,
      visionModel: "google/gemini-2.0-flash-001",
      chatModel: "google/gemini-2.0-flash-001",
      autoApproveRecommendations: false,
    },
  })

  useEffect(() => {
    if (settings) {
      const aiValues: any = {}
      Object.keys(aiSettingsFormSchema.shape).forEach(key => {
        if (settings[key] !== undefined) {
          aiValues[key] = settings[key]
        }
      })
      if (Object.keys(aiValues).length > 0) {
        form.reset({ ...form.getValues(), ...aiValues })
      }
    }
  }, [settings, form])

  async function onSubmit(data: AISettingsFormValues) {
    updateSettings.mutate({ category: "ai", data })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Configuration</CardTitle>
        <CardDescription>
          Manage how AI interacts with your library and recommendations.
        </CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <FieldGroup>
            <Field orientation="horizontal">
              <div className="flex flex-col gap-1.5 flex-1">
                <FieldLabel htmlFor="enableDiscovery">Book Discovery</FieldLabel>
                <FieldDescription>
                  Enable AI metadata extraction from book cover photos.
                </FieldDescription>
              </div>
              <Checkbox
                id="enableDiscovery"
                checked={form.watch("enableDiscovery")}
                onCheckedChange={(checked) => form.setValue("enableDiscovery", !!checked)}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="refreshFrequency">Suggestion Refresh Frequency</FieldLabel>
              <select
                id="refreshFrequency"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                {...form.register("refreshFrequency")}
              >
                <option value="on-demand">On-demand only</option>
                <option value="daily">Daily digest</option>
                <option value="weekly">Weekly digest</option>
              </select>
              <FieldDescription>
                How often the AI should refresh book recommendations.
              </FieldDescription>
              <FieldError errors={[{ message: form.formState.errors.refreshFrequency?.message }]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="maxSuggestions">Max Suggestions</FieldLabel>
              <Input
                id="maxSuggestions"
                type="number"
                {...form.register("maxSuggestions", { valueAsNumber: true })}
              />
              <FieldDescription>
                Maximum number of recommendations to display at once.
              </FieldDescription>
              <FieldError errors={[{ message: form.formState.errors.maxSuggestions?.message }]} />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="visionModel">Vision Model</FieldLabel>
                <Input
                  id="visionModel"
                  {...form.register("visionModel")}
                />
                <FieldDescription>
                  Model used for cover photo analysis.
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="chatModel">Chat Model</FieldLabel>
                <Input
                  id="chatModel"
                  {...form.register("chatModel")}
                />
                <FieldDescription>
                  Model used for recommendation reasoning.
                </FieldDescription>
              </Field>
            </div>

            <Field orientation="horizontal">
              <div className="flex flex-col gap-1.5 flex-1">
                <FieldLabel htmlFor="autoApproveRecommendations">Auto-approve Recommendations</FieldLabel>
                <FieldDescription>
                  Automatically approve recommendations submitted by public users.
                </FieldDescription>
              </div>
              <Checkbox
                id="autoApproveRecommendations"
                checked={form.watch("autoApproveRecommendations")}
                onCheckedChange={(checked) => form.setValue("autoApproveRecommendations", !!checked)}
              />
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button type="submit" disabled={updateSettings.isPending}>
            {updateSettings.isPending ? "Saving..." : "Save AI Settings"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
