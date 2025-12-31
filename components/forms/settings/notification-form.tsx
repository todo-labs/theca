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
import { useEffect } from "react"

export function NotificationForm() {
  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      emailNotifications: true,
      frequency: "immediate",
    },
  })

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch("/api/settings")
        const data = await response.json()
        
        const values: any = {}
        Object.keys(notificationFormSchema.shape).forEach(key => {
          if (data[key] !== undefined) {
            values[key] = data[key]
          }
        })
        
        if (Object.keys(values).length > 0) {
          form.reset({ ...form.getValues(), ...values })
        }
      } catch (error) {
        console.error("Failed to load notification settings:", error)
      }
    }
    loadSettings()
  }, [form])

  async function onSubmit(data: NotificationFormValues) {
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: "notifications", data }),
      })

      if (!response.ok) throw new Error("Failed to save settings")
      
      toast.success("Notification settings updated")
    } catch (error) {
      toast.error("Failed to update notifications")
      console.error(error)
    }
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
          <Button type="submit" disabled={form.formState.isSubmitting}>
            Save Notification Settings
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
