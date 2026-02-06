import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { getAuth } from "firebase/auth"
import { useNavigate } from "react-router"
import { toast } from "sonner"
import { API_BASE_URL } from "~/constants"

const formSchema = z.object({
  name: z.string().min(1, "Required").max(255),
  description: z.string().min(1, "Required").max(255),
  image: z.url().optional().or(z.literal("")),
  logoUrl: z.url().optional().or(z.literal("")),
  websiteUrl: z.url().optional().or(z.literal("")),
  remainingtokens: z.coerce.number().int().min(0).optional(),
  brightIdAppId: z.string().max(500).optional(),
  deadline: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

export default function CreateProjectPage() {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", description: "" },
  })

  const onSubmit = async (data: FormData) => {
    const cleanedData = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        value === "" ? undefined : value,
      ])
    )
    const token = await getAuth().currentUser?.getIdToken()
    const res = await fetch(`${API_BASE_URL}/api/projects/create-project`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cleanedData),
    })
    res.ok
      ? (toast.success("Project created"), navigate("/dashboard"))
      : toast.error("Failed")
  }

  return (
    <div className="mx-auto max-w-7xl mt-5 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="w-2xl max-w-full">
          <CardHeader>
            <CardTitle>Create New Project</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Field data-invalid={!!errors.name}>
                <FieldLabel>Project Name</FieldLabel>
                <FieldDescription>
                  Choose a clear, memorable name (max 100 chars)
                </FieldDescription>
                <Input
                  placeholder="e.g. Save the Rainforest"
                  {...register("name")}
                />
                <FieldError>{errors.name?.message}</FieldError>
              </Field>

              <Field data-invalid={!!errors.description}>
                <FieldLabel>Description</FieldLabel>
                <FieldDescription>
                  Tell people what your project is about (10–500 chars)
                </FieldDescription>
                <Textarea
                  rows={4}
                  placeholder="We are building..."
                  {...register("description")}
                />
                <FieldError>{errors.description?.message}</FieldError>
              </Field>

              <Field>
                <FieldLabel>
                  Project Image URL{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </FieldLabel>
                <FieldDescription>
                  Main banner image shown on the project page
                </FieldDescription>
                <Input
                  type="url"
                  placeholder="https://example.com/banner.jpg"
                  {...register("image")}
                />
                <FieldError>{errors.image?.message}</FieldError>
              </Field>

              <Field>
                <FieldLabel>
                  Logo URL{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </FieldLabel>
                <FieldDescription>
                  Small square logo (recommended 400x400px)
                </FieldDescription>
                <Input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  {...register("logoUrl")}
                />
                <FieldError>{errors.logoUrl?.message}</FieldError>
              </Field>

              <Field>
                <FieldLabel>
                  Website{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </FieldLabel>
                <Input
                  type="url"
                  placeholder="https://yourproject.com"
                  {...register("websiteUrl")}
                />
                <FieldError>{errors.websiteUrl?.message}</FieldError>
              </Field>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Project"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="hidden lg:block space-y-6">
          <h2 className="text-xl font-semibold">Live Preview</h2>

          <Card className="overflow-hidden border-2">
            <div className="h-48 bg-muted relative">
              {watch("image") ? (
                <img
                  src={watch("image")}
                  alt="Banner"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                  <p className="text-white text-3xl font-bold">
                    Your Project Banner
                  </p>
                </div>
              )}
              {watch("logoUrl") && (
                <img
                  src={watch("logoUrl")}
                  alt="Logo"
                  className="absolute bottom-0 left-6 translate-y-1/2 w-24 h-24 rounded-full border-4 border-background shadow-xl"
                />
              )}
            </div>

            <div className="p-6 pt-16">
              <h1 className="text-3xl font-bold">
                {watch("name") || "Your Project Name"}
              </h1>
              <p className="mt-3 text-muted-foreground">
                {watch("description") ||
                  "Your project description will appear here..."}
              </p>

              {watch("websiteUrl") && (
                <a
                  href={watch("websiteUrl")}
                  className="mt-4 inline-block text-primary hover:underline"
                >
                  {watch("websiteUrl")}
                </a>
              )}
            </div>
          </Card>

          <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
            Tip: This is how your project will look
          </div>
        </div>
      </div>
    </div>
  )
}
