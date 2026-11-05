import { createEffect, createSignal, onCleanup, type JSX } from 'solid-js';

const GAP = 8;
const EDGE = 16;

/**
 * Shows `content` in a floating panel while the pointer or keyboard focus is
 * on `children`. With `tooltip` the panel is a small text label. Without it
 * the panel is a hover card, which a click on the trigger also toggles.
 *
 * The panel is a manual popover in the top layer, so an ancestor with
 * overflow: hidden doesn't clip it. It sits on `side` of the trigger, flips
 * when there is no room, and stays 16px inside the viewport. It stays open
 * while focus is inside the trigger or the panel. Escape closes it.
 */
export default function Hover(props: {
  content: JSX.Element;
  children: JSX.Element;
  side?: 'top' | 'bottom';
  /** ms before opening; default 200 for a tooltip, 100 for a hover card */
  delay?: number;
  tooltip?: boolean;
  /** Wrapper classes; defaults to inline-block. */
  class?: string;
  /** Panel classes, added to .a-popover. */
  panelClass?: string;
}) {
  const [open, setOpen] = createSignal(false);
  let wrapper!: HTMLDivElement;
  let panel!: HTMLDivElement;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const later = (value: boolean, ms: number) => {
    clearTimeout(timer);
    timer = setTimeout(() => setOpen(value), ms);
  };
  const enter = () => later(true, props.delay ?? (props.tooltip ? 200 : 100));
  const leave = () => {
    clearTimeout(timer);
    const active = document.activeElement;
    if (wrapper.contains(active) || panel.contains(active)) return;
    later(false, props.tooltip ? 100 : 200);
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Escape' || !open()) return;
    e.preventDefault();
    e.stopPropagation();
    clearTimeout(timer);
    setOpen(false);
  };

  const position = () => {
    if (!open()) return;
    const t = wrapper.getBoundingClientRect();
    const w = panel.offsetWidth;
    const h = panel.offsetHeight;
    const below = t.bottom + GAP;
    const above = t.top - h - GAP;
    const top =
      props.side === 'top'
        ? above < EDGE
          ? below
          : above
        : below + h > innerHeight - EDGE
          ? above
          : below;
    const left = t.left + (t.width - w) / 2;
    panel.style.left = `${Math.max(EDGE, Math.min(left, innerWidth - w - EDGE))}px`;
    panel.style.top = `${Math.max(EDGE, Math.min(top, innerHeight - h - EDGE))}px`;
  };

  createEffect(() => {
    if (open()) {
      if (!panel.matches(':popover-open')) panel.showPopover();
      position();
    } else if (panel.matches(':popover-open')) panel.hidePopover();
  });
  addEventListener('resize', position);
  addEventListener('scroll', position, true);
  onCleanup(() => {
    clearTimeout(timer);
    removeEventListener('resize', position);
    removeEventListener('scroll', position, true);
  });

  const handlers = {
    onMouseEnter: enter,
    onMouseLeave: leave,
    onFocusIn: enter,
    onFocusOut: leave,
    onKeyDown,
  };

  return (
    <div
      ref={wrapper}
      class={props.class ?? 'inline-block'}
      {...handlers}
      onClick={(e) => {
        if (props.tooltip) return;
        e.stopPropagation(); // don't trigger a clickable card around it
        clearTimeout(timer);
        setOpen(!open());
      }}
    >
      {props.children}
      <div
        ref={panel}
        popover="manual"
        role={props.tooltip ? 'tooltip' : undefined}
        data-tooltip={props.tooltip ? '' : undefined}
        class={`a-popover fixed inset-auto ${props.panelClass ?? ''}`}
        {...handlers}
        onClick={(e) => e.stopPropagation()}
      >
        {props.content}
      </div>
    </div>
  );
}
