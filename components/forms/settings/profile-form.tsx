"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
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

import { ProfileFormValues, profileFormSchema } from "@/lib/schemas/settings"
import { useEffect } from "react"

export function ProfileForm() {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  })

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch("/api/settings")
        const data = await response.json()
        
        const values: any = {}
        Object.keys(profileFormSchema.shape).forEach(key => {
          if (data[key] !== undefined) {
            values[key] = data[key]
          }
        })
        
        if (Object.keys(values).length > 0) {
          form.reset({ ...form.getValues(), ...values })
        }
      } catch (error) {
        console.error("Failed to load profile settings:", error)
      }
    }
    loadSettings()
  }, [form])

  async function onSubmit(data: ProfileFormValues) {
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: "profile", data }),
      })

      if (!response.ok) throw new Error("Failed to save settings")
      
      toast.success("Profile updated successfully")
    } catch (error) {
      toast.error("Failed to update profile")
      console.error(error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          Update your personal information and how others see you.
        </CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Display Name</FieldLabel>
              <Input
                id="name"
                placeholder="John Doe"
                {...form.register("name")}
              />
              <FieldDescription>
                This is your public display name.
              </FieldDescription>
              <FieldError errors={[{ message: form.formState.errors.name?.message }]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="email">Email Address</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                {...form.register("email")}
              />
              <FieldDescription>
                Your primary contact email address.
              </FieldDescription>
              <FieldError errors={[{ message: form.formState.errors.email?.message }]} />
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            Save Changes
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
