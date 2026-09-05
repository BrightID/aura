import { toast } from '@aura/ui';

/**
 * Shown when a profile/connections lookup 404s: the aura node only creates a
 * profile once the user receives their first evaluation, so nudge them to
 * share the profile (or, for other subjects, to evaluate them).
 */
export default function ProfileNotFoundHint(props: {
  subjectId: string;
  /** Whether the missing profile is the logged-in user's own. */
  self?: boolean;
}) {
  const share = async () => {
    const url = `${window.location.origin}/subject/${props.subjectId}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Aura profile', url });
        return;
      }
      await navigator.clipboard?.writeText(url);
      toast.success('Profile link copied', {
        description: 'Send it to a connection and ask for an evaluation.',
      });
    } catch {
      /* user dismissed the share sheet */
    }
  };

  return (
    <a-card
      variant="glass"
      data-testid="profile-not-found-hint"
      class="flex flex-col gap-3 p-4"
    >
      <div class="flex items-center gap-2">
        <a-icon name="info" />
        <p class="font-medium text-foreground">
          {props.self
            ? 'No Aura profile yet'
            : 'This subject has no profile yet'}
        </p>
      </div>
      <a-text size="sm" class="text-muted-foreground">
        {props.self
          ? 'Your profile is created when another player evaluates you. ' +
            'Share your profile link with a connection and ask for your first evaluation.'
          : 'A profile is created once someone evaluates this subject — ' +
            'evaluate them or share their profile to get them started.'}
      </a-text>
      <a-button
        size="sm"
        variant="glass"
        data-testid="share-profile"
        onClick={share}
      >
        Share profile
      </a-button>
    </a-card>
  );
}
