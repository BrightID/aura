import { useForm } from "react-hook-form"
import { useRef } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { addDoc, collection, doc, updateDoc } from "firebase/firestore"
import { db, auth } from "@/lib/firebase"
import { Calendar } from "@/components/ui/calendar"
import { useAuraEvent } from "~/lib/aura"
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
type FormInput = z.input<typeof schema>

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
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormInput, undefined, FormData>({
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

  const dialogRef = useRef<HTMLElement>(null)
  const nameRef = useRef<HTMLElement>(null)
  const descRef = useRef<HTMLElement>(null)
  const imageRef = useRef<HTMLElement>(null)
  const levelRef = useRef<HTMLElement>(null)
  const activeRef = useRef<HTMLElement>(null)

  useAuraEvent<{ open: boolean }>(dialogRef, "open-change", (e) => {
    if (!e.open) onClose()
  })
  useAuraEvent<string>(nameRef, "change", (v) =>
    setValue("name", v, { shouldValidate: true }),
  )
  useAuraEvent<string>(descRef, "change", (v) => setValue("description", v))
  useAuraEvent<string>(imageRef, "change", (v) =>
    setValue("image", v, { shouldValidate: true }),
  )
  useAuraEvent<string>(levelRef, "change", (v) =>
    setValue("requirementLevel", Number(v), { shouldValidate: true }),
  )
  useAuraEvent<boolean>(activeRef, "change", (v) => setValue("isActive", v))

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
    <a-dialog open={isOpen} ref={dialogRef}>
      <div slot="content" className="max-w-lg">
        <div className="flex flex-col gap-1.5">
          <a-head level="3">{project ? "Edit Project" : "Add Project"}</a-head>
        </div>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))}>
          <div className="grid gap-4 py-4">
            <div>
              <a-label for="name">Name</a-label>
              <a-input
                name="name"
                ref={nameRef}
                value={watch("name") ?? ""}
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name.message}</p>
              )}
            </div>

            <div>
              <a-label for="description">Description</a-label>
              <a-textarea
                name="description"
                ref={descRef}
                value={watch("description") ?? ""}
              />
            </div>

            <div>
              <a-label for="image">Image URL</a-label>
              <a-input
                name="image"
                ref={imageRef}
                value={watch("image") ?? ""}
                placeholder="https://example.com/image.jpg"
              />
              {errors.image && (
                <p className="text-red-500 text-sm">{errors.image.message}</p>
              )}
            </div>

            <div>
              <a-label for="requirementLevel">Requirement Level</a-label>
              <a-input
                name="requirementLevel"
                type="number"
                ref={levelRef}
                value={String(watch("requirementLevel") ?? "")}
              />
              {errors.requirementLevel && (
                <p className="text-red-500 text-sm">
                  {errors.requirementLevel.message}
                </p>
              )}
            </div>

            <div>
              <a-label>Deadline</a-label>
              <a-popover align="start">
                <a-button
                  slot="trigger"
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {deadline ? format(deadline, "PPP") : "Pick a date"}
                </a-button>
                <div slot="content" className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={deadline}
                    onSelect={(d) => d && setValue("deadline", d)}
                  />
                </div>
              </a-popover>
              {errors.deadline && (
                <p className="text-red-500 text-sm">
                  {errors.deadline.message}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <a-label for="isActive">Active</a-label>
              <a-switch
                name="isActive"
                ref={activeRef}
                checked={watch("isActive")}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <a-button variant="outline" type="button" onClick={onClose}>
              Cancel
            </a-button>
            <a-button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Save"}
            </a-button>
          </div>
        </form>
      </div>
    </a-dialog>
  )
}
