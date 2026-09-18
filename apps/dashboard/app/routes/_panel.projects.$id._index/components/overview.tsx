import { useState, type ReactNode } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import {
  Calendar,
  Check,
  Copy,
  CreditCard,
  FileText,
  Globe,
  Hash,
  Shield,
  Zap,
} from 'lucide-react';
import type { Project } from '~/types/projects';
import { plans } from '~/constants/subscriptions';
import { copyToClipboard } from '~/utils/clipboard';
import { cn } from '~/lib/utils';

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Hash;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-[10rem_1fr] sm:items-center sm:gap-4">
      <dt className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-3.5 shrink-0" />
        {label}
      </dt>
      <dd className="min-w-0 text-sm">{children}</dd>
    </div>
  );
}

export default function OverviewSection({
  project,
  onOpenTab,
}: {
  project: Project;
  onOpenTab: (tab: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const plan = plans.find((item) => item.id === project.selectedPlanId);

  const copyId = () => {
    if (!project.brightIdAppId) return;
    copyToClipboard(project.brightIdAppId);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const stats = [
    {
      label: 'Status',
      value: project.isActive ? 'Active' : 'Inactive',
      hint: project.isActive ? 'Accepting verifications' : 'Paused',
      icon: (
        <span
          className={cn(
            'size-2 rounded-full',
            project.isActive ? 'bg-emerald-400' : 'bg-muted-foreground',
          )}
        />
      ),
    },
    {
      label: 'Remaining tokens',
      value: project.remainingtokens.toLocaleString(),
      hint: 'This billing period',
      icon: <Zap className="size-3.5 text-muted-foreground" />,
    },
    {
      label: 'Requirement',
      value:
        project.requirementLevel !== null
          ? `Level ${project.requirementLevel}`
          : 'Not set',
      hint: project.requirementLevel === null ? 'Set in General' : 'Aura score',
      icon: <Shield className="size-3.5 text-muted-foreground" />,
    },
    {
      label: 'Created',
      value: format(new Date(project.createdAt), 'MMM d, yyyy'),
      hint: formatDistanceToNow(new Date(project.createdAt), {
        addSuffix: true,
      }),
      icon: <Calendar className="size-3.5 text-muted-foreground" />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 overflow-hidden rounded-xl border bg-card lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={cn(
              'flex flex-col gap-2 p-5',
              i % 2 === 1 && 'border-l',
              i >= 2 && 'border-t lg:border-t-0',
              i === 2 && 'lg:border-l',
            )}
          >
            <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              {stat.icon}
              {stat.label}
            </p>
            <p className="text-xl font-semibold tracking-tight">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.hint}</p>
          </div>
        ))}
      </div>

      <a-card variant="default">
        <div className="flex flex-col gap-1">
          <h3 className="font-semibold leading-none">Project details</h3>
          <p className="text-sm text-muted-foreground">
            Identifiers and links for this project
          </p>
        </div>
        <dl className="mt-4 divide-y">
          <DetailRow icon={Hash} label="BrightID App ID">
            {project.brightIdAppId ? (
              <span className="inline-flex min-w-0 items-center gap-2">
                <code className="truncate rounded bg-muted px-1.5 py-0.5 text-xs">
                  {project.brightIdAppId}
                </code>
                <button
                  type="button"
                  onClick={copyId}
                  className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label={copied ? 'Copied' : 'Copy App ID'}
                >
                  {copied ? (
                    <Check className="size-3.5" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onOpenTab('brightid')}
                className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Not connected — set up verification
              </button>
            )}
          </DetailRow>

          <DetailRow icon={Globe} label="Website">
            {project.websiteUrl ? (
              <a
                href={project.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate hover:underline"
              >
                {project.websiteUrl}
              </a>
            ) : (
              <span className="text-muted-foreground">None</span>
            )}
          </DetailRow>

          {plan ? (
            <DetailRow icon={CreditCard} label="Plan">
              {plan.name}
            </DetailRow>
          ) : project.selectedPlanId ? (
            <DetailRow icon={CreditCard} label="Plan">
              Plan #{project.selectedPlanId}
            </DetailRow>
          ) : (
            <DetailRow icon={CreditCard} label="Plan">
              <span className="text-muted-foreground">Free</span>
            </DetailRow>
          )}

          {project.deadline ? (
            <DetailRow icon={Calendar} label="Period ends">
              {format(new Date(project.deadline), 'MMMM d, yyyy')}
            </DetailRow>
          ) : null}
        </dl>

        {project.landingMarkdown ? (
          <div className="mt-4 space-y-2 border-t pt-4">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="size-3.5" />
              Landing page content
            </p>
            <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-muted/50 p-4 text-sm">
              {project.landingMarkdown}
            </pre>
          </div>
        ) : null}
      </a-card>
    </div>
  );
}
