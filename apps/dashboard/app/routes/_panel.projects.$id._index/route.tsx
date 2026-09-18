import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';
import { getUserProjects } from '~/utils/apis';
import { ProjectDetailSkeleton } from './components/project-details';
import { ProjectTabs } from './components/project-tabs';
import { ProjectHeader } from './components/project-header';

export default function ProjectDetail() {
  const { data: projects } = useQuery({
    queryFn: getUserProjects,
    queryKey: ['user-projects'],
  });
  const [tab, setTab] = useState('overview');
  const params = useParams();

  const focusedProject = useMemo(
    () => projects?.find((item) => item.id == params['id']),
    [projects, params],
  );

  if (!focusedProject) return <ProjectDetailSkeleton />;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-5 lg:px-6">
      <ProjectHeader
        project={focusedProject}
        onOpenSettings={() => setTab('settings')}
      />
      <ProjectTabs project={focusedProject} tab={tab} onTabChange={setTab} />
    </div>
  );
}
