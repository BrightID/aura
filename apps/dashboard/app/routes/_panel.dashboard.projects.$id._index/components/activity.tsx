import {
  format,
  formatDistanceToNow,
  formatDistanceToNowStrict,
} from "date-fns"
import { Clock, Activity, Calendar } from "lucide-react"
import type { Project } from "~/types/projects"

export default function ProjectActivity({ project }: { project: Project }) {
  return (
    <div className="space-y-6">
      <a-card variant="default">
        <div className="flex flex-col gap-1.5">
          <h3 className="font-semibold leading-none">Timeline</h3>
          <p className="text-sm text-muted-foreground">
            Project activity and important dates
          </p>
        </div>
        <div className="mt-6">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 mt-0.5">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Project Created</p>
                <p className="text-sm text-muted-foreground">
                  {format(
                    new Date(project.createdAt),
                    "MMMM d, yyyy 'at' h:mm a"
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNowStrict(new Date(project.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>

            {project.updatedAt && (
              <>
                <a-separator />
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted mt-0.5">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Last Updated</p>
                    <p className="text-sm text-muted-foreground">
                      {format(
                        new Date(project.updatedAt),
                        "MMMM d, yyyy 'at' h:mm a"
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(project.updatedAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              </>
            )}

            {project.deadline && (
              <>
                <a-separator />
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/10 mt-0.5">
                    <Calendar className="h-4 w-4 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Deadline</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(project.deadline), "MMMM d, yyyy")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(project.deadline), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </a-card>
    </div>
  )
}
