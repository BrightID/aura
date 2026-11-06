import { useEffect, useState } from 'react';
import { subscribe, toast, type ToastData } from '@aura/ui/toast';

/**
 * Renders the toasts raised with `toast()` from '@aura/ui/toast'. Mount once.
 * Clicking a toast, or its close button, dismisses it.
 */
export function AuraToaster() {
  const [list, setList] = useState<ToastData[]>([]);
  // The store updates toast objects in place, so copy each one to give React
  // a changed value.
  useEffect(() => subscribe((all) => setList(all.map((t) => ({ ...t })))), []);

  return (
    <div className="a-toaster" role="status" aria-live="polite">
      {list.map((t) => (
        <div
          key={t.id}
          className="a-toast"
          data-variant={t.variant}
          data-hidden={t.visible ? undefined : ''}
          onClick={() => toast.dismiss(t.id)}
        >
          <button
            type="button"
            className="a-toast-close"
            aria-label="Dismiss"
            onClick={() => toast.dismiss(t.id)}
          >
            ×
          </button>
          <div className="flex items-start gap-2">
            {t.variant === 'loading' && (
              <span className="mt-0.5 size-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            <div className="min-w-0 flex-1">
              <div className="font-medium">{String(t.message)}</div>
              {t.description && (
                <div className="mt-0.5 text-muted-foreground">
                  {t.description}
                </div>
              )}
              {t.action && (
                <button
                  type="button"
                  className="a-button mt-2"
                  data-size="sm"
                  data-variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    t.action!.onClick();
                  }}
                >
                  {t.action.label}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
