import type { JSX } from 'solid-js';

/**
 * Pulsing placeholder block for loading states. Size/shape it with `class`
 * (`h-*`, `w-*`, `rounded-*`) — mirrors the shimmer used in the charts.
 */
export default function Skeleton(props: {
  class?: string;
  style?: JSX.CSSProperties;
}) {
  return (
    <div
      aria-hidden="true"
      class={`animate-pulse rounded-md bg-foreground/10 ${props.class ?? ''}`}
      style={props.style}
    />
  );
}
