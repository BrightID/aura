import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { useParams } from "react-router"
import { getUserProjects } from "~/utils/apis"
import { ProjectDetailSkeleton } from "./components/project-details"
import { ProjectTabs } from "./components/project-tabs"
import { ProjectHeader } from "./components/project-header"

export default function ProjectDetail() {
  const { data: projects } = useQuery({
    queryFn: getUserProjects,
    queryKey: ["user-projects"],
  })

  const params = useParams()

  const focusedProject = useMemo(
    () => projects?.find((item) => item.id == params["id"]),
    [projects, params]
  )

  if (!focusedProject) return <ProjectDetailSkeleton />

  return (
    <div>
      <ProjectHeader project={focusedProject} />
      <div className="max-w-7xl mx-auto px-6 py-6">
        <ProjectTabs project={focusedProject} />
      </div>
    </div>
  )
}
