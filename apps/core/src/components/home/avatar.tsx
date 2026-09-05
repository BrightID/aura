import { createMemo, type JSX, Show } from 'solid-js';
import makeBlockie from 'ethereum-blockies-base64';
import { createProfilePhotoQuery } from '@/queries/backup';
import { authStore } from '@/store/auth';
import { hash } from '@aura/domain/crypto';

/**
 * Avatar with the real BrightID profile photo when available (decrypted from
 * the recovery backup — needs a password session). When there's no photo,
 * falls back to a deterministic blockie identicon generated from the
 * `subjectId` (BrightID); only falls back further to initials when no
 * `subjectId` is given. Pass `subjectId` to enable the photo and the hover
 * preview: hovering shows the enlarged image, like the old
 * `BrightIdProfilePicture`.
 */
export default function Avatar(props: {
  name: string;
  subjectId?: string;
  /** Disable the enlarged hover preview (e.g. inside dialogs). */
  noHover?: boolean;
  class?: string;
  style?: JSX.CSSProperties;
  /** Image URL used when the backup has no photo (e.g. a gravatar link). */
  fallbackSrc?: string;
}) {
  const initial = () => (props.name?.trim()?.[0] ?? '?').toUpperCase();

  // Photos are stored per-connection in the logged-in user's backup.
  const authKey = createMemo(() => {
    const user = authStore.user;
    return user?.brightId && user.password
      ? hash(user.brightId + user.password)
      : '';
  });
  const photo = createProfilePhotoQuery(
    authKey,
    () => props.subjectId ?? '',
    () => authStore.user?.password ?? '',
  );
  // Backup photos are data URIs; tolerate raw base64 just in case.
  const src = () => {
    const data = photo.data;
    if (data)
      return data.startsWith('data:') ? data : `data:image/jpeg;base64,${data}`;
    if (props.fallbackSrc) return props.fallbackSrc;
    // No real photo: use a deterministic blockie identicon from the BrightID.
    if (props.subjectId) return makeBlockie(props.subjectId);
    return undefined;
  };

  const Circle = () => (
    <Show
      when={src()}
      fallback={
        <div
          class={`bg-foreground/10 border-primary flex shrink-0 items-center justify-center rounded-full border-2 font-bold text-foreground ${props.class ?? ''}`}
          style={props.style}
        >
          {initial()}
        </div>
      }
    >
      <img
        data-testid={`picture-${props.subjectId}`}
        src={src()}
        alt={props.name}
        class={`border-primary shrink-0 rounded-full border-2 object-cover transition-transform duration-200 hover:scale-105 ${props.class ?? ''}`}
        style={props.style}
      />
    </Show>
  );

  return (
    <Show when={src() && !props.noHover} fallback={<Circle />}>
      <a-hover-card openDelay={100}>
        <span slot="trigger" class="inline-block">
          <Circle />
        </span>
        <div slot="content" class="p-1">
          <img
            src={src()}
            alt={props.name}
            class="h-auto max-h-72 max-w-72 rounded-md object-cover"
          />
          <p class="mt-1 text-center text-sm text-muted-foreground">
            {props.name}
          </p>
        </div>
      </a-hover-card>
    </Show>
  );
}
