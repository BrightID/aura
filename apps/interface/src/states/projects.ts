import { localStorageSignal } from '@/lib/state'
import type { Project } from '@/types/projects'
import { signal } from '@lit-labs/signals'

export const projects = signal<Project[]>([])
export const trackedProject = localStorageSignal<Project | null>(
  'trackedProject',
  null as Project | null,
  (value) => (value ? (JSON.parse(value) as Project) : null),
  (value) => (value ? JSON.stringify(value) : '')
)

export const enrolledProjects = localStorageSignal(
  'enrolledProjects',
  [] as Project[],
  (value: string | null) => JSON.parse(value ?? '[]') as Project[],
  (value: Project[]) => JSON.stringify(value)
)

export function enrollProject(project: Project) {
  const projects = enrolledProjects.get()

  if (projects.find((item) => item.id === project.id)) {
    return
  }

  enrolledProjects.set([...projects, project])
}

export function isEnrolledInProject(id: number) {
  const projects = enrolledProjects.get()

  return !!projects.find((item) => item.id === id)
}
