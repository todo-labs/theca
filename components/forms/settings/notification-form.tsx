"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
} from "@/components/ui/field"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

import { NotificationFormValues, notificationFormSchema } from "@/lib/schemas/settings"
import { useSettings, useUpdateSettings } from "@/hooks/queries/use-settings"
import { useEffect } from "react"

export function NotificationForm() {
  const { data: settings } = useSettings()
  const updateSettings = useUpdateSettings()

  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      emailNotifications: true,
      frequency: "immediate",
    },
  })

  useEffect(() => {
    if (settings) {
      const values: any = {}
      Object.keys(notificationFormSchema.shape).forEach(key => {
        if (settings[key] !== undefined) {
          values[key] = settings[key]
        }
      })
      if (Object.keys(values).length > 0) {
        form.reset({ ...form.getValues(), ...values })
      }
    }
  }, [settings, form])

  async function onSubmit(data: NotificationFormValues) {
    updateSettings.mutate({ category: "notifications", data })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Configure how and when you receive alerts from your library.
        </CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <FieldGroup>
            <Field orientation="horizontal">
              <div className="flex flex-col gap-1.5 flex-1">
                <FieldLabel htmlFor="emailNotifications">Email Notifications</FieldLabel>
                <FieldDescription>
                  Receive email alerts for new user recommendations.
                </FieldDescription>
              </div>
              <Checkbox
                id="emailNotifications"
                checked={form.watch("emailNotifications")}
                onCheckedChange={(checked) => form.setValue("emailNotifications", !!checked)}
              />
            </Field>


            <Field>
              <FieldLabel htmlFor="frequency">Notification Frequency</FieldLabel>
              <select
                id="frequency"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                {...form.register("frequency")}
              >
                <option value="immediate">Immediate</option>
                <option value="daily">Daily Digest</option>
              </select>
              <FieldDescription>
                How often you want to be notified.
              </FieldDescription>
              <FieldError errors={[{ message: form.formState.errors.frequency?.message }]} />
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button type="submit" disabled={updateSettings.isPending}>
            {updateSettings.isPending ? "Saving..." : "Save Notification Settings"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
