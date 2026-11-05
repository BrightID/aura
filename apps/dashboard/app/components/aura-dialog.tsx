import {
  createContext,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import { cn } from '~/lib/utils';

/**
 * The <dialog> that portaled popups (menus, tooltips) inside an AuraDialog
 * must render into. A modal dialog makes the rest of the page inert and sits
 * in the top layer, so a popup portaled to <body> would be hidden behind it.
 */
export const PortalContainer = createContext<HTMLElement | null>(null);

/**
 * A modal native <dialog>, controlled by `open`. Esc, a click on the backdrop
 * and the close button call onOpenChange(false); the parent then sets `open`.
 *
 * With `side` it is a sheet that slides in from that edge and has no close
 * button. `className` goes on the panel, which is the <dialog> itself.
 */
export function AuraDialog({
  open,
  onOpenChange,
  label,
  side,
  className,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  label?: string;
  side?: 'left' | 'right' | 'top' | 'bottom';
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [container, setContainer] = useState<HTMLDialogElement | null>(null);

  useEffect(() => {
    const el = ref.current!;
    if (open && !el.open) el.showModal();
    else if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={(el) => {
        ref.current = el;
        setContainer(el);
      }}
      aria-label={label}
      className={cn(side ? 'a-sheet' : 'a-dialog', className)}
      data-side={side}
      onClose={() => {
        // The close event arrives a task after close(), so a quick close and
        // reopen sees it while open again. Ignore it then.
        if (!ref.current?.open) onOpenChange(false);
      }}
      onClick={(e) => {
        // The <dialog> is the visible panel: a click whose target is the
        // dialog may be on its padding, so close only when it lands outside.
        const el = ref.current!;
        if (e.target !== el) return;
        const r = el.getBoundingClientRect();
        const inside =
          e.clientX >= r.left &&
          e.clientX <= r.right &&
          e.clientY >= r.top &&
          e.clientY <= r.bottom;
        if (!inside) onOpenChange(false);
      }}
    >
      <PortalContainer.Provider value={container}>
        {children}
      </PortalContainer.Provider>
      {!side && (
        <button
          type="button"
          className="a-dialog-close"
          aria-label="Close dialog"
          onClick={() => onOpenChange(false)}
        >
          ×
        </button>
      )}
    </dialog>
  );
}
