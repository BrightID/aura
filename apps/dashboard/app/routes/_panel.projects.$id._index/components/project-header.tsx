import {
  ArrowLeft,
  Globe,
  ExternalLink,
  Settings,
  AppWindow,
} from 'lucide-react';
import { Link } from 'react-router';
import type { Project } from '~/types/projects';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';

function hostname(url: string) {
  try {
    return new URL(url).host;
  } catch {
    return url.replace(/^https?:\/\//, '');
  }
}

export function ProjectHeader({
  project,
  onOpenSettings,
}: {
  project: Project;
  onOpenSettings: () => void;
}) {
  return (
    <header className="flex flex-col gap-4">
      <Link
        to="/projects"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Projects
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          {project.logoUrl ? (
            <img
              src={project.logoUrl}
              alt=""
              className="size-12 shrink-0 rounded-lg border object-cover"
            />
          ) : (
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border bg-muted text-lg font-semibold text-muted-foreground">
              {project.name[0].toUpperCase()}
            </div>
          )}

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-xl font-semibold tracking-tight">
                {project.name}
              </h1>
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium',
                  project.isActive
                    ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                    : 'border-border bg-muted text-muted-foreground',
                )}
              >
                <span
                  className={cn(
                    'size-1.5 rounded-full',
                    project.isActive ? 'bg-emerald-400' : 'bg-muted-foreground',
                  )}
                />
                {project.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            {project.description ? (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {project.description}
              </p>
            ) : null}
            {project.websiteUrl ? (
              <a
                href={project.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <Globe className="size-3.5" />
                {hostname(project.websiteUrl)}
              </a>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button variant="default" size="sm" asChild>
            <a
              href={`/interface/projects/${project.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <AppWindow className="size-4" />
              Your page
            </a>
          </Button>
          {project.websiteUrl ? (
            <Button variant="outline" size="sm" asChild>
              <a
                href={project.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="size-4" />
                Website
              </a>
            </Button>
          ) : null}
          <Button variant="ghost" size="sm" onClick={onOpenSettings}>
            <Settings className="size-4" />
            Settings
          </Button>
        </div>
      </div>
    </header>
  );
}
