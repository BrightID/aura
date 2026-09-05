import { A, useNavigate, useParams } from '@solidjs/router';
import { createEffect, type ParentProps, Show } from 'solid-js';
import HomeHeader from '@/components/home/home-header';
import ProfileHeaderCard from '@/components/home/profile-header-card';
import ProfileInfoPerformance from '@/components/home/profile-info-performance';
import ProfileNotFoundHint from '@/components/home/profile-not-found-hint';
import { useLevelupProgress } from '@/hooks/use-levelup-progress';
import { useRequireSession } from '@/hooks/use-require-session';
import { useViewMode } from '@/hooks/use-view-mode';
import {
  createBrightIdProfileQuery,
  createInboundConnectionsQuery,
} from '@/queries/connections';
import { isNotFound } from '@aura/domain/http';
import { viewSlugToViewMode } from '@aura/domain/view-mode';

const tabClass =
  'border-b-2 border-transparent px-1 pb-2 text-muted-foreground transition-colors';
const activeTabClass = '!border-primary !text-foreground';

/** Shared chrome for a view's tabs (header, profile, evaluate/levelup nav). */
export default function HomeViewLayout(props: ParentProps) {
  const navigate = useNavigate();
  const params = useParams();
  const subjectId = useRequireSession();

  // Reject unknown view slugs.
  createEffect(() => {
    if (subjectId() && params.view && !(params.view in viewSlugToViewMode)) {
      navigate('/home', { replace: true });
    }
  });

  const vm = useViewMode();
  const levelup = useLevelupProgress(vm.currentRoleEvaluatorEvaluationCategory);
  const base = () => `/home/${params.view}`;

  // 404 on profile/connections = the node hasn't seen this user yet — a
  // profile only gets created when someone evaluates them.
  const profile = createBrightIdProfileQuery(() => subjectId() ?? '');
  const inbound = createInboundConnectionsQuery(() => subjectId() ?? '');
  const profileMissing = () =>
    isNotFound(profile.error) || isNotFound(inbound.error);

  return (
    <Show when={subjectId()} fallback={<div class="p-6">Not logged in</div>}>
      <div class="px-5 pt-6 pb-10">
        <HomeHeader />
        <ProfileHeaderCard subjectId={subjectId()!} />
        <Show when={profileMissing()}>
          <div class="mt-4">
            <ProfileNotFoundHint subjectId={subjectId()!} self />
          </div>
        </Show>
        <div class="my-5" />
        <ProfileInfoPerformance subjectId={subjectId()!} />

        <nav class="mt-4 flex gap-6 border-b border-border">
          <A href={base()} end class={tabClass} activeClass={activeTabClass}>
            Evaluate
          </A>
          <Show
            when={levelup().isUnlocked}
            fallback={
              <span class={`${tabClass} cursor-not-allowed opacity-40`}>
                Level Up
              </span>
            }
          >
            <A
              href={`${base()}/levelup`}
              class={tabClass}
              activeClass={activeTabClass}
            >
              Level Up
            </A>
          </Show>
        </nav>

        <div class="mt-4">{props.children}</div>
      </div>
    </Show>
  );
}
