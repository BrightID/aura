"use client"

import { formatDistanceToNow } from "date-fns"
import { Globe, MoreVertical, ExternalLink, Calendar, Zap } from "lucide-react"
import { Link } from "react-router"
import type { Project } from "~/components/projects-table"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { cn } from "~/lib/utils"

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      to={`/dashboard/projects/${project.id}`}
      className={cn(
        "group relative cursor-pointer rounded-lg border bg-card p-4 transition-all hover:border-foreground/20 hover:shadow-md"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {project.logoUrl ? (
            <img
              src={project.logoUrl || "/placeholder.svg"}
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
                  {project.websiteUrl.replace(/^https?:\/\//, "")}
                </span>
              </div>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <ExternalLink className="mr-2 h-4 w-4" />
              Visit Site
            </DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
        {project.description || "No description provided"}
      </p>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge
            variant={project.isActive ? "default" : "secondary"}
            className="text-xs"
          >
            {project.isActive ? "Active" : "Inactive"}
          </Badge>
          {project.deadline && (
            <Badge variant="outline" className="text-xs">
              <Calendar className="mr-1 h-3 w-3" />
              {formatDistanceToNow(new Date(project.deadline), {
                addSuffix: true,
              })}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Zap className="h-3 w-3" />
          {project.remainingtokens.toLocaleString()} tokens
        </div>
      </div>

      <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
        Updated{" "}
        {formatDistanceToNow(new Date(project.updatedAt || project.createdAt), {
          addSuffix: true,
        })}
      </div>
    </Link>
  )
}
