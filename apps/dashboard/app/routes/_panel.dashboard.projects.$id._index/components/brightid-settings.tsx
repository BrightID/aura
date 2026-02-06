"use client"

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
  FormDescription,
  FormMessage,
} from "~/components/ui/form"
import { useMutation } from "@tanstack/react-query"
import { useParams } from "react-router"
import { getAuth } from "firebase/auth"
import axios from "axios"
import { API_BASE_URL } from "~/constants"
import _ from "lodash"
import { toast } from "sonner"

const formSchema = z.object({
  key: z.string().min(1, "Key is required"),
  name: z.string().min(1, "Name is required"),
  sponsoring: z.boolean().default(true),
  testing: z.boolean(),
  idsAsHex: z.boolean(),
  soulbound: z.boolean(),
  soulboundMessage: z.string().optional(),
  usingBlindSig: z.boolean(),
  verifications: z.string().optional(),
  verificationExpirationLength: z.coerce.number().optional(),
  nodeUrl: z.url().optional().or(z.literal("")),
  context: z.string().optional(),
  description: z.string().optional(),
  links: z.string().optional(),
  images: z.string().optional(),
  callbackUrl: z.url().optional().or(z.literal("")),
})

type FormValues = z.infer<typeof formSchema>

export function BrightIdSettingsForm({
  initialData,
}: {
  initialData?: FormValues
}) {
  const params = useParams()

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: _.merge(initialData, {
      sponsoring: true,
      testing: false,
      idsAsHex: false,
      soulbound: false,
      usingBlindSig: false,
      nodeUrl: "https://node.brightid.org",
      description: "",
      context: "",
      soulboundMessage: "",
      links: "",
      images: "",
      callbackUrl: "",
      verifications: "",
    }),
  })

  const { isPending, mutate } = useMutation({
    mutationKey: ["update-project", params.id],
    mutationFn: async (data: FormValues) => {
      const token = await getAuth().currentUser?.getIdToken()

      return axios.post(
        `${API_BASE_URL}/api/projects/update-project-brightid`,
        {
          brightIdApp: data,
          projectId: Number(params["id"]),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
    },
    onSuccess(data, variables, onMutateResult, context) {
      toast.success("Bright Id settings updated")
      context.client.invalidateQueries({ queryKey: ["user-projects"] })
    },
    onError(error, variables, onMutateResult, context) {
      toast.error(error.message)
    },
  })

  const onSubmit = (data: FormValues) => {
    mutate(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Core identifiers for your BrightID app
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Key *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="my-unique-app" />
                  </FormControl>
                  <FormDescription>
                    Unique identifier for the app (cannot be changed later)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="My Awesome App" />
                  </FormControl>
                  <FormDescription>
                    Friendly name shown to BrightID users
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>App Mode & Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="testing"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>Testing Mode</FormLabel>
                    <FormDescription>
                      Uses test network and doesn't affect mainnet scores
                    </FormDescription>
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
            <FormField
              control={form.control}
              name="idsAsHex"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>IDs as Hex</FormLabel>
                    <FormDescription>
                      User IDs formatted as Ethereum addresses (0x...)
                    </FormDescription>
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

        {/* Verification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Verification Method</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="soulbound"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>Soulbound (v1.5)</FormLabel>
                    <FormDescription>
                      Uses context-bound signatures with Ethereum address
                    </FormDescription>
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
            {form.watch("soulbound") && (
              <>
                <FormField
                  control={form.control}
                  name="context"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Context *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="myapp" />
                      </FormControl>
                      <FormDescription>
                        Name of the context (e.g., your app name)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="soulboundMessage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Soulbound Message</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value ?? ""}
                          rows={3}
                        />
                      </FormControl>
                      <FormDescription>
                        Message shown in wallet when user signs (optional)
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={form.control}
              name="usingBlindSig"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>Blind Signatures (v1.6)</FormLabel>
                    <FormDescription>
                      More private verification method
                    </FormDescription>
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

        {/* Verifications & Node */}
        <Card>
          <CardHeader>
            <CardTitle>Verifications & Node</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="verifications"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verifications Script</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value ?? ""}
                      rows={8}
                      className="font-mono text-sm"
                    />
                  </FormControl>
                  <FormDescription>
                    Aura script defining which verifications are accepted (one
                    per line allowed)
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="verificationExpirationLength"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Expiration (ms)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value as string}
                      type="number"
                      placeholder="2592000000 (30 days)"
                    />
                  </FormControl>
                  <FormDescription>
                    How long verifications remain valid (0 = never expire)
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nodeUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Node URL</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="https://node.brightid.org"
                    />
                  </FormControl>
                  <FormDescription>
                    Custom BrightID/Aura node (optional)
                  </FormDescription>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Callback */}
        <Card>
          <CardHeader>
            <CardTitle>Callback</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="callbackUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Callback URL</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="https://myapp.com/api/brightid-callback"
                    />
                  </FormControl>
                  <FormDescription>
                    Called when a user connects their BrightID
                  </FormDescription>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button disabled={isPending} type="submit" size="lg">
            Save BrightID Settings
          </Button>
        </div>
      </form>
    </Form>
  )
}
