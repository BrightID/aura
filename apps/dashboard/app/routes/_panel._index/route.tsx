import { useQuery } from '@tanstack/react-query';
import { ProjectsTable } from '~/components/projects-table';
import { ProjectUsageChart } from './components/usage-chart-area';
import { getUserProjects } from '~/utils/apis';

export default function PanelDashboard() {
  const { data, isPending, isError } = useQuery({
    queryFn: getUserProjects,
    queryKey: ['user-projects'],
  });

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <h3 className="text-xl font-bold mb-5">Projects List</h3>
        {isPending ? (
          <div className="space-y-3">
            <div className="a-skeleton h-10 w-full max-w-xs" />
            <div className="a-skeleton h-48 w-full rounded-lg" />
          </div>
        ) : isError ? (
          <div className="rounded-lg border bg-card px-6 py-16 text-center">
            <p className="font-medium text-destructive">
              Could not load projects
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Please try again later
            </p>
          </div>
        ) : (
          <ProjectsTable data={data ?? []} />
        )}
      </div>
      {!isPending && !isError && (data?.length ?? 0) > 0 ? (
        <div className="px-4 lg:px-6">
          <ProjectUsageChart projectId={data?.[0]?.id ?? ''} />
        </div>
      ) : null}
    </div>
  );
}
