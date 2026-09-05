import {
  ArrowLeft,
  Globe,
  ExternalLink,
  Settings,
  AppWindowIcon,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import type { Project } from '~/types/projects';

export function ProjectHeader({ project }: { project: Project }) {
  const navigate = useNavigate();

  return (
    <header className="border-b bg-card">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <a-button
          variant="ghost"
          size="sm"
          className="mb-4 -ml-2"
          onClick={() => navigate('/projects')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </a-button>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {project.logoUrl ? (
              <img
                src={project.logoUrl}
                alt={project.name}
                className="h-16 w-16 rounded-xl object-cover border"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-foreground/10 to-foreground/5 border">
                <span className="text-2xl font-semibold text-foreground/70">
                  {project.name[0].toUpperCase()}
                </span>
              </div>
            )}

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold tracking-tight">
                  {project.name}
                </h1>
                <a-badge variant={project.isActive ? 'default' : 'secondary'}>
                  {project.isActive ? 'Active' : 'Inactive'}
                </a-badge>
              </div>
              <p className="text-muted-foreground mt-1">
                {project.description || 'No description'}
              </p>
              {project.websiteUrl && (
                <a
                  href={project.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1 mt-1"
                >
                  <Globe className="h-3 w-3" />
                  {project.websiteUrl}
                </a>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {project.websiteUrl && (
              <a
                href={`/interface/projects/${project.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <a-button variant="outline">
                  <AppWindowIcon className="mr-2 h-4 w-4" />
                  Your page
                </a-button>
              </a>
            )}
            {project.websiteUrl && (
              <a
                href={project.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <a-button variant="outline">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Website
                </a-button>
              </a>
            )}
            <a-button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </a-button>
          </div>
        </div>
      </div>
    </header>
  );
}
