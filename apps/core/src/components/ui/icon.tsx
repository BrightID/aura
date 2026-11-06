import type { JSX } from 'solid-js';
import { iconUrl } from '@aura/ui/icon';

/**
 * A Lucide icon, looked up by name among the icons bundled in @aura/ui (see
 * @aura/ui/icon) and drawn as a CSS mask, so it takes the surrounding text
 * colour and is 1em square. Size it with text-* classes. Without a label it is
 * hidden from screen readers.
 */
export default function Icon(props: {
  name: string;
  label?: string;
  class?: string;
  style?: JSX.CSSProperties;
}) {
  return (
    <span
      class={`a-icon ${props.class ?? ''}`}
      style={{
        '--icon-url': `url("${iconUrl(props.name)}")`,
        ...props.style,
      }}
      role={props.label ? 'img' : undefined}
      aria-label={props.label || undefined}
      aria-hidden={props.label ? undefined : 'true'}
    />
  );
}
