import { createEffect, createSignal, For, type JSX, onCleanup } from 'solid-js';

const DEFAULT_PAGE_SIZE = 20;

/**
 * `<For>`-based incremental list (the old `InfiniteScrollLocal`, Solid-native):
 * renders a growing window over `items` and reveals the next `pageSize` batch
 * when a bottom sentinel scrolls into view. All data is already in memory —
 * this only paces rendering so a long list doesn't mount hundreds of rows at
 * once. Reconciliation is by item reference, like Solid's `<For>`.
 */
export default function IncrementalList<T>(props: {
  items: T[];
  children: (item: T, index: () => number) => JSX.Element;
  /** Rows revealed per batch (default 20). */
  pageSize?: number;
  /** Class for the wrapping container (e.g. `flex flex-col gap-3`). */
  class?: string;
}) {
  const pageSize = () => props.pageSize ?? DEFAULT_PAGE_SIZE;
  const [limit, setLimit] = createSignal(pageSize());
  const [sentinel, setSentinel] = createSignal<HTMLElement>();

  // Collapse the window back to one page when the list itself changes
  // (filter / sort / navigation), so we don't keep a stale large limit.
  createEffect(() => {
    props.items;
    setLimit(pageSize());
  });

  const visible = () => props.items.slice(0, limit());
  const hasMore = () => limit() < props.items.length;

  // Re-observe whenever the window grows: IntersectionObserver fires once on
  // observe, so reconnecting after each batch keeps filling until the sentinel
  // leaves the viewport (handles tall screens / small pages without scrolling).
  createEffect(() => {
    const el = sentinel();
    limit();
    if (!el || !hasMore()) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        setLimit((n) => Math.min(n + pageSize(), props.items.length));
      }
    });
    observer.observe(el);
    onCleanup(() => observer.disconnect());
  });

  return (
    <div class={props.class}>
      <For each={visible()}>{props.children}</For>
      <div ref={setSentinel} class="h-px w-full" aria-hidden="true" />
    </div>
  );
}
