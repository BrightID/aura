'use client';

import { formatDistanceToNow } from 'date-fns';
import { Globe, MoreVertical, ExternalLink, Calendar, Zap } from 'lucide-react';
import { Link } from 'react-router';
import type { Project } from '~/components/projects-table';
import { cn } from '~/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      to={`/projects/${project.id}`}
      className={cn(
        'group relative cursor-pointer rounded-lg border bg-card p-4 transition-all hover:border-foreground/20 hover:shadow-md',
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {project.logoUrl ? (
            <img
              src={project.logoUrl || '/placeholder.svg'}
              alt={project.name}
              className="h-10 w-10 rounded-md object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-foreground/10 to-foreground/5">
              <span className="text-lg font-semibold text-foreground/70">
                {project.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex flex-col">
            <h3 className="font-semibold text-foreground">{project.name}</h3>
            {project.websiteUrl && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Globe className="h-3 w-3" />
                <span className="truncate max-w-[180px]">
                  {project.websiteUrl.replace(/^https?:\/\//, '')}
                </span>
              </div>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="a-button h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              type="button"
              data-variant="ghost"
              data-size="icon"
              aria-label="Project actions"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
              <ExternalLink className="h-4 w-4" />
              Visit Site
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={(e) => e.stopPropagation()}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
        {project.description || 'No description provided'}
      </p>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="a-badge text-xs"
            data-variant={project.isActive ? 'default' : 'secondary'}
          >
            {project.isActive ? 'Active' : 'Inactive'}
          </span>
          {project.deadline && (
            <span className="a-badge text-xs" data-variant="outline">
              <Calendar className="mr-1 h-3 w-3" />
              {formatDistanceToNow(new Date(project.deadline), {
                addSuffix: true,
              })}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Zap className="h-3 w-3" />
          {(project.remainingtokens ?? 0).toLocaleString()} tokens
        </div>
      </div>

      <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
        Updated{' '}
        {formatDistanceToNow(new Date(project.updatedAt || project.createdAt), {
          addSuffix: true,
        })}
      </div>
    </Link>
  );
}
