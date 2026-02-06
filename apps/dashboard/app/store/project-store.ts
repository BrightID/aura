import { create } from "zustand"

type Project = {
  id: string
  name: string
  description: string
  requirementLevel: number
  deadline: string | null
  isActive: boolean
  image?: string | null
}

type ProjectStore = {
  selectedProject: Project | null
  setSelectedProject: (project: Project | null) => void
}

export const useProjectStore = create<ProjectStore>((set) => ({
  selectedProject: null,
  setSelectedProject: (project) => set({ selectedProject: project }),
}))
