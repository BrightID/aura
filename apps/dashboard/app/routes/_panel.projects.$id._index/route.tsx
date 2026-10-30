import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router';
import { getUserProjects } from '~/utils/apis';
import { ProjectDetailSkeleton } from './components/project-details';
import { ProjectTabs } from './components/project-tabs';
import { ProjectHeader } from './components/project-header';

export default function ProjectDetail() {
  const {
    data: projects,
    isPending,
    isError,
  } = useQuery({
    queryFn: getUserProjects,
    queryKey: ['user-projects'],
  });
  const [tab, setTab] = useState('overview');
  const params = useParams();

  const focusedProject = useMemo(
    () => projects?.find((item) => item.id == params['id']),
    [projects, params],
  );

  if (isPending) return <ProjectDetailSkeleton />;

  if (isError || !focusedProject) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 px-4 py-16 text-center">
        <p className="font-medium">
          {isError ? 'Could not load this project' : 'Project not found'}
        </p>
        <p className="max-w-sm text-sm text-muted-foreground">
          {isError
            ? 'Please try again later.'
            : 'This project is not in your account.'}
        </p>
        <Link to="/projects">
          <a-button variant="outline">Back to projects</a-button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-5 lg:px-6">
      <ProjectHeader project={focusedProject} />
      <ProjectTabs project={focusedProject} tab={tab} onTabChange={setTab} />
    </div>
  );
}
