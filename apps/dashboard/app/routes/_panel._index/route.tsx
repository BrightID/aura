import { useQuery } from "@tanstack/react-query"
import { ProjectsTable, type Project } from "~/components/projects-table"
import { ProjectUsageChart } from "./components/usage-chart-area"
import { API_BASE_URL } from "~/constants"
import { getUserProjects } from "~/utils/apis"

export default function PanelDashboard() {
  const { data, error, isLoading, status } = useQuery({
    queryFn: getUserProjects,
    queryKey: ["user-projects"],
  })

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <h3 className="text-xl font-bold mb-5">Projects List</h3>
        <ProjectsTable data={data ?? []} />
      </div>
      <div className="px-4 lg:px-6">
        <ProjectUsageChart projectId={data?.[0]?.id ?? ""} />
      </div>
    </div>
  )
}
