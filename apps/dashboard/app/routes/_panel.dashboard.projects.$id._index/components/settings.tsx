import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import { Switch } from "~/components/ui/switch"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form"
import { ImageIcon, Upload } from "lucide-react"
import { useMutation } from "@tanstack/react-query"
import axios from "axios"
import { API_BASE_URL } from "~/constants"
import _ from "lodash"
import { getAuth } from "firebase/auth"
import type { Project } from "~/types/projects"

const formSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  isActive: z.boolean(),
  logoUrl: z.string().optional(),
  image: z.string().optional(),
  brightIdAppId: z.string().min(1, "BrightID App ID is required"),
})

type FormValues = z.infer<typeof formSchema>

export function SettingsTab({ project }: { project: Project }) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: project.name ?? "",
      description: project.description ?? "",
      websiteUrl: project.websiteUrl ?? "",
      isActive: project.isActive ?? true,
      logoUrl: project.logoUrl ?? "",
      image: project.image ?? "",
      brightIdAppId: project.brightIdAppId ?? "",
    },
  })

  const { isPending, mutate } = useMutation({
    mutationKey: ["update-project", project.id],
    mutationFn: async (data: FormValues) => {
      const token = await getAuth().currentUser?.getIdToken()

      return axios.post(
        `${API_BASE_URL}/api/projects/update-project`,
        _.merge(project, data),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
    },
    onSuccess(data, variables, onMutateResult, context) {
      context.client.invalidateQueries({ queryKey: ["user-projects"] })
    },
  })

  const onSubmit = (data: FormValues) => {
    mutate(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Configure your project settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="websiteUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website URL</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="https://..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div>
                    <FormLabel>Project Status</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      {field.value ? "Active" : "Inactive"}
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Branding</CardTitle>
            <CardDescription>Customize your project appearance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="logoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo URL</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-4">
                      <div className="h-20 w-20 rounded-lg bg-muted overflow-hidden flex items-center justify-center">
                        {field.value ? (
                          <img
                            src={field.value}
                            alt="Logo"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <Input
                        {...field}
                        placeholder="https://example.com/logo.png"
                        value={field.value ?? ""}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Image URL</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-4">
                      <div className="h-20 w-20 rounded-lg bg-muted overflow-hidden flex items-center justify-center">
                        {field.value ? (
                          <img
                            src={field.value}
                            alt="Project"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <Input
                        {...field}
                        placeholder="https://example.com/image.jpg"
                        value={field.value ?? ""}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Integration</CardTitle>
            <CardDescription>BrightID integration settings</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="brightIdAppId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>BrightID App ID</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input readOnly {...field} className="font-mono" />
                      <Button type="button" variant="outline" size="sm">
                        Copy
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button disabled={isPending} type="submit">
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  )
}
