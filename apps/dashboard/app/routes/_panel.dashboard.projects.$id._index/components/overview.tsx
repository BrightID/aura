import { format } from "date-fns"
import { ImageIcon, Calendar, CreditCard, FileText, Hash } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "~/components/ui/card"
import { Separator } from "~/components/ui/separator"
import type { Project } from "~/types/projects"

export default function OverviewSection({ project }: { project: Project }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${project.isActive ? "bg-green-500" : "bg-muted-foreground"}`}
              />
              <span className="text-2xl font-semibold">
                {project.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Remaining Tokens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-semibold">
              {project.remainingtokens.toLocaleString()}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Requirement Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-semibold">
              {project.requirementLevel !== null
                ? `Level ${project.requirementLevel}`
                : "Not set"}
            </span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>
            Basic information about your project
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Hash className="h-4 w-4" />
                BrightID App ID
              </p>
              <code className="text-sm bg-muted px-2 py-1 rounded">
                {project.brightIdAppId}
              </code>
            </div>

            {project.websiteUrl && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Website URL
                </p>
                <a
                  href={project.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:underline"
                >
                  {project.websiteUrl}
                </a>
              </div>
            )}

            {project.deadline && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Deadline
                </p>
                <p className="text-sm">
                  {format(new Date(project.deadline), "MMMM d, yyyy")}
                </p>
              </div>
            )}

            {project.selectedPlanId && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Plan ID
                </p>
                <p className="text-sm">Plan #{project.selectedPlanId}</p>
              </div>
            )}
          </div>

          {project.landingMarkdown && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Landing Page Content
                </p>
                <div className="text-sm bg-muted/50 p-4 rounded-lg max-h-48 overflow-auto">
                  <pre className="whitespace-pre-wrap">
                    {project.landingMarkdown}
                  </pre>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
