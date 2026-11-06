import {
  BarChart3,
  CreditCard,
  Settings,
  ShieldCheck,
  View,
} from 'lucide-react';
import OverviewSection from './overview';
import ProjectUsage from './usage';
import { UserRequiredLevelCard } from './requirement-level';
import ProjectBilling from './billing';
import { SettingsTab } from './settings';
import { BrightIdSettingsForm } from './brightid-settings';
import type { Project } from '~/types/projects';
import PreviewTab from './preview-tab';
import { AuraTabs } from '~/components/aura-tabs';

export function ProjectTabs({
  project,
  tab,
  onTabChange,
}: {
  project: Project;
  tab: string;
  onTabChange: (tab: string) => void;
}) {
  return (
    <div className="space-y-6">
      <AuraTabs
        compact
        value={tab}
        onValueChange={onTabChange}
        tabs={[
          {
            value: 'overview',
            label: (
              <>
                <BarChart3 className="h-4 w-4" /> Overview
              </>
            ),
          },
          {
            value: 'billing',
            label: (
              <>
                <CreditCard className="h-4 w-4" /> Billing
              </>
            ),
          },
          {
            value: 'settings',
            label: (
              <>
                <Settings className="h-4 w-4" /> General
              </>
            ),
          },
          {
            value: 'brightid',
            label: (
              <>
                <ShieldCheck className="h-4 w-4" /> Verification
              </>
            ),
          },
          {
            value: 'preview',
            label: (
              <>
                <View className="h-4 w-4" /> Preview
              </>
            ),
          },
        ]}
      />

      <div role="tabpanel" className="a-tab-panel" hidden={tab !== 'overview'}>
        <OverviewSection project={project} onOpenTab={onTabChange} />
      </div>
      <div role="tabpanel" className="a-tab-panel" hidden={tab !== 'billing'}>
        <div className="space-y-6">
          <ProjectUsage project={project} />
          <ProjectBilling project={project} />
        </div>
      </div>
      <div role="tabpanel" className="a-tab-panel" hidden={tab !== 'settings'}>
        <SettingsTab key={project.id} project={project} />
      </div>
      <div role="tabpanel" className="a-tab-panel" hidden={tab !== 'brightid'}>
        <div className="space-y-6">
          <UserRequiredLevelCard key={project.id} project={project} />
          <BrightIdSettingsForm initialData={project.brightIdApp as never} />
        </div>
      </div>
      <div role="tabpanel" className="a-tab-panel" hidden={tab !== 'preview'}>
        <PreviewTab project={project} />
      </div>
    </div>
  );
}
