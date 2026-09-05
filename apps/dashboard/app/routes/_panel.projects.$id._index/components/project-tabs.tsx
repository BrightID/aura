import {
  BarChart3,
  CreditCard,
  Settings,
  SunDimIcon,
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

export function ProjectTabs({ project }: { project: Project }) {
  return (
    <a-tabs value="overview" className="space-y-6">
      <a-tab value="overview" className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4" /> Overview
      </a-tab>
      <a-tab value="billing" className="flex items-center gap-2">
        <CreditCard className="h-4 w-4" /> Billing
      </a-tab>
      <a-tab value="settings" className="flex items-center gap-2">
        <Settings className="h-4 w-4" /> General
      </a-tab>
      <a-tab value="brightid" className="flex items-center gap-2">
        <SunDimIcon className="h-5 w-5" /> Verification
      </a-tab>
      <a-tab value="preview" className="flex items-center gap-2">
        <View className="h-4 w-4" /> Preview
      </a-tab>

      <a-tab-panel slot="panel" value="overview">
        <OverviewSection project={project} />
      </a-tab-panel>
      <a-tab-panel slot="panel" value="billing">
        <div className="space-y-6">
          <ProjectUsage project={project} />
          <ProjectBilling project={project} />
        </div>
      </a-tab-panel>
      <a-tab-panel slot="panel" value="settings">
        <div className="space-y-6">
          <UserRequiredLevelCard project={project} />
          <SettingsTab project={project} />
        </div>
      </a-tab-panel>
      <a-tab-panel slot="panel" value="brightid">
        <BrightIdSettingsForm initialData={project.brightIdApp as never} />
      </a-tab-panel>
      <a-tab-panel slot="panel" value="preview">
        <PreviewTab project={project} />
      </a-tab-panel>
    </a-tabs>
  );
}
