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

import { ReadingGoalsFormValues, readingGoalsFormSchema } from "@/lib/schemas/settings"
import { useEffect } from "react"

export function ReadingGoalsForm() {
  const form = useForm<ReadingGoalsFormValues>({
    resolver: zodResolver(readingGoalsFormSchema),
    defaultValues: {
      booksPerMonth: 2,
      booksPerYear: 24,
      pagesPerWeek: 150,
      deadlineTracking: true,
    },
  })

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch("/api/settings")
        const data = await response.json()
        
        const values: any = {}
        Object.keys(readingGoalsFormSchema.shape).forEach(key => {
          if (data[key] !== undefined) {
            values[key] = data[key]
          }
        })
        
        if (Object.keys(values).length > 0) {
          form.reset({ ...form.getValues(), ...values })
        }
      } catch (error) {
        console.error("Failed to load reading goal settings:", error)
      }
    }
    loadSettings()
  }, [form])

  async function onSubmit(data: ReadingGoalsFormValues) {
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: "goals", data }),
      })

      if (!response.ok) throw new Error("Failed to save settings")
      
      toast.success("Reading goals updated")
    } catch (error) {
      toast.error("Failed to update goals")
      console.error(error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reading Goals</CardTitle>
        <CardDescription>
          Set targets to stay motivated and track your reading progress.
        </CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="booksPerMonth">Books per Month</FieldLabel>
              <Input
                id="booksPerMonth"
                type="number"
                {...form.register("booksPerMonth", { valueAsNumber: true })}
              />
              <FieldDescription>
                Number of books you aim to finish each month.
              </FieldDescription>
              <FieldError errors={[{ message: form.formState.errors.booksPerMonth?.message }]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="booksPerYear">Books per Year</FieldLabel>
              <Input
                id="booksPerYear"
                type="number"
                {...form.register("booksPerYear", { valueAsNumber: true })}
              />
              <FieldDescription>
                Your annual reading target.
              </FieldDescription>
              <FieldError errors={[{ message: form.formState.errors.booksPerYear?.message }]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="pagesPerWeek">Pages per Week</FieldLabel>
              <Input
                id="pagesPerWeek"
                type="number"
                {...form.register("pagesPerWeek", { valueAsNumber: true })}
              />
              <FieldDescription>
                Weekly target for pages read across all books.
              </FieldDescription>
              <FieldError errors={[{ message: form.formState.errors.pagesPerWeek?.message }]} />
            </Field>

            <Field orientation="horizontal">
              <div className="flex flex-col gap-1.5 flex-1">
                <FieldLabel htmlFor="deadlineTracking">Deadline Tracking</FieldLabel>
                <FieldDescription>
                  Track progress towards annual and monthly deadlines.
                </FieldDescription>
              </div>
              <Checkbox
                id="deadlineTracking"
                checked={form.watch("deadlineTracking")}
                onCheckedChange={(checked) => form.setValue("deadlineTracking", !!checked)}
              />
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            Save Goals
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
