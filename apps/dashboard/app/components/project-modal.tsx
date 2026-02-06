import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { addDoc, collection, doc, updateDoc } from "firebase/firestore"
import { db, auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import type { Project } from "./projects-table"

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  image: z.url("Invalid URL").or(z.literal("")),
  requirementLevel: z.coerce.number().int().min(1, "Min 1"),
  deadline: z.date(),
  isActive: z.boolean(),
})

type FormData = z.infer<typeof schema>

export function ProjectModal({
  isOpen,
  onClose,
  project = null,
}: {
  isOpen: boolean
  onClose: () => void
  onSave: (project: Project) => void
  project?: Project | null
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: project
      ? {
          name: project.name,
          description: project.description,
          image: project.image || "",
          requirementLevel: project.requirementLevel,
          deadline: project.deadline ? new Date(project.deadline) : new Date(),
          isActive: project.isActive,
        }
      : {
          name: "",
          description: "",
          image: "",
          requirementLevel: 1,
          deadline: new Date(),
          isActive: true,
        },
  })

  const deadline = watch("deadline")
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const payload = {
        ...data,
        deadline: data.deadline.toISOString(),
        userId: auth.currentUser?.uid,
        createdAt: project?.createdAt || new Date(),
        updatedAt: new Date(),
      }

      if (project?.id) {
        await updateDoc(doc(db, "projects", project.id), payload)
        return { ...project, ...payload }
      } else {
        const docRef = await addDoc(collection(db, "projects"), payload)
        return { id: docRef.id, ...payload }
      }
    },
    onSuccess: (saved) => {
      onClose()
      reset()

      queryClient.invalidateQueries({ queryKey: ["user-projects"] })
    },
  })

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{project ? "Edit Project" : "Add Project"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))}>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...register("description")} />
            </div>

            <div>
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                {...register("image")}
                placeholder="https://example.com/image.jpg"
              />
              {errors.image && (
                <p className="text-red-500 text-sm">{errors.image.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="requirementLevel">Requirement Level</Label>
              <Input
                id="requirementLevel"
                type="number"
                min="1"
                {...register("requirementLevel")}
              />
              {errors.requirementLevel && (
                <p className="text-red-500 text-sm">
                  {errors.requirementLevel.message}
                </p>
              )}
            </div>

            <div>
              <Label>Deadline</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {deadline ? format(deadline, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={deadline}
                    onSelect={(d) => d && setValue("deadline", d)}
                  />
                </PopoverContent>
              </Popover>
              {errors.deadline && (
                <p className="text-red-500 text-sm">
                  {errors.deadline.message}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Label htmlFor="isActive">Active</Label>
              <Switch
                id="isActive"
                checked={watch("isActive")}
                onCheckedChange={(v) => setValue("isActive", v)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
