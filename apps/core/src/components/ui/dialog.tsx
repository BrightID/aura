import { onCleanup, type JSX, type Ref } from 'solid-js';

export type DialogHandle = { show(): void; hide(): void };

/** Matches the .a-dialog exit transition in @aura/ui/aura.css. */
const EXIT_MS = 220;

/**
 * A modal native <dialog> with a close button. It opens when its trigger is
 * clicked or through ref.show(), and closes on the close button, Esc, a click
 * on the backdrop, or ref.hide().
 *
 * onClose runs after the exit transition, so a parent that clears the
 * dialog's data in onClose doesn't empty it while it is still fading out.
 */
export default function Dialog(props: {
  label: string;
  trigger?: JSX.Element;
  /** `let d: DialogHandle | undefined; <Dialog ref={d}>` works: Solid turns it into a setter. */
  ref?: Ref<DialogHandle>;
  onClose?: () => void;
  children: JSX.Element;
}) {
  let el!: HTMLDialogElement;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const show = () => {
    clearTimeout(timer); // reopened mid-exit: don't run the pending onClose
    if (!el.open) el.showModal();
  };
  const hide = () => {
    if (el.open) el.close();
  };
  (props.ref as ((handle: DialogHandle) => void) | undefined)?.({ show, hide });
  onCleanup(() => clearTimeout(timer));

  // The dialog element is the visible panel, so a click whose target is the
  // dialog itself may be on its padding. Close only when it lands outside.
  const onClick = (e: MouseEvent) => {
    if (e.target !== el) return;
    const r = el.getBoundingClientRect();
    const inside =
      e.clientX >= r.left &&
      e.clientX <= r.right &&
      e.clientY >= r.top &&
      e.clientY <= r.bottom;
    if (!inside) hide();
  };

  return (
    <>
      {props.trigger && (
        <span
          class="contents"
          onClick={(e) => {
            e.stopPropagation();
            show();
          }}
        >
          {props.trigger}
        </span>
      )}
      <dialog
        ref={el}
        class="a-dialog"
        aria-label={props.label}
        onClick={onClick}
        onClose={() => {
          // The close event arrives a task after close(), so hide() then
          // show() reopens the dialog before it. Skip it when that happened.
          if (el.open) return;
          timer = setTimeout(() => {
            if (!el.open) props.onClose?.();
          }, EXIT_MS);
        }}
      >
        {props.children}
        <button
          type="button"
          class="a-dialog-close"
          aria-label="Close dialog"
          onClick={hide}
        >
          ×
        </button>
      </dialog>
    </>
  );
}
