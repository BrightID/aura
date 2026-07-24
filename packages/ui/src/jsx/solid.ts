import type {
  BadgeElement,
  ButtonColors,
  ButtonElement,
  ButtonSize,
  ButtonVariant,
  CardElement,
  CollapseElement,
  ContainerElement,
  DialogElement,
  FlexElement,
  GridElement,
  HeadingElement,
  HoverCardContentElement,
  HoverCardElement,
  HoverCardTriggerElement,
  IconElement,
  InputElement,
  PopoverElement,
  ScrollAreaElement,
  SeparatorElement,
  TabElement,
  TabPanelElement,
  TabsElement,
  TextElement,
  ThemeProvider,
  ToasterElement,
  TooltipElement,
} from "../index"
import type { JSX } from "solid-js"

export type TypedCustomEvent<
  T extends EventTarget = EventTarget,
  D = unknown,
> = CustomEvent<D> & {
  target: T
  currentTarget: T
}

export type CEProps<T extends HTMLElement> = JSX.HTMLAttributes<T> & {
  ref?: T | ((el: T) => void)
  slot?: string
}

/**
 * Base solid-js JSX typings for every `a-*` custom element shipped by
 * `@aura/ui`. Consuming apps augment `solid-js`'s `JSX.IntrinsicElements`
 * themselves (see apps/core/aura-ui.d.ts) for any app-only elements —
 * `declare module` blocks merge across files in the same TS program.
 */
declare module "solid-js" {
  namespace JSX {
    interface IntrinsicElements {
      // ── Theme ────────────────────────────────────────────────────────────
      "a-theme-provider": CEProps<ThemeProvider>

      // ── Toaster ──────────────────────────────────────────────────────────
      "a-toaster": CEProps<ToasterElement>

      // ── Button ───────────────────────────────────────────────────────────
      "a-button": CEProps<ButtonElement> & {
        variant?: ButtonVariant
        size?: ButtonSize
        color?: ButtonColors
        type?: "button" | "submit" | "reset"
        disabled?: boolean
        selected?: boolean
      }

      // ── Card ─────────────────────────────────────────────────────────────
      "a-card": CEProps<CardElement> & {
        variant?: "default" | "glass"
        interactive?: boolean
      }

      // ── Badge ────────────────────────────────────────────────────────────
      "a-badge": CEProps<BadgeElement> & {
        variant?:
          | "default"
          | "secondary"
          | "outline"
          | "destructive"
          | "accent"
          | "glass"
        size?: "xs" | "sm" | "md" | "lg"
        rounded?: boolean
        removable?: boolean
      }

      // ── Dialog ───────────────────────────────────────────────────────────
      // Events: listen to 'open-change' (CustomEvent<{open:boolean}>) via ref
      "a-dialog": CEProps<DialogElement> & {
        open?: boolean
      }

      // ── Input ────────────────────────────────────────────────────────────
      // Events: listen to 'change' (CustomEvent<string>) via ref
      "a-input": CEProps<InputElement> & {
        type?: "text" | "email" | "password" | "number"
        label?: string
        name?: string
        placeholder?: string
        value?: string
        disabled?: boolean
      }

      // ── Separator ────────────────────────────────────────────────────────
      "a-separator": CEProps<SeparatorElement> & {
        orientation?: "horizontal" | "vertical"
      }

      // ── Tabs ─────────────────────────────────────────────────────────────
      // Events: listen to 'change' (CustomEvent<{value:string}>) via ref
      "a-tabs": CEProps<TabsElement> & {
        value?: string
        onChange?: (event: TypedCustomEvent<TabsElement>) => void
      }
      "a-tab": CEProps<TabElement> & {
        value?: string
        disabled?: boolean
      }
      "a-tab-panel": CEProps<TabPanelElement> & {
        value?: string
      }

      // ── Scroll Area ──────────────────────────────────────────────────────
      "a-scroll-area": CEProps<ScrollAreaElement> & {
        direction?: "vertical" | "horizontal" | "both"
      }

      // ── Layout ───────────────────────────────────────────────────────────
      "a-flex": CEProps<FlexElement> & {
        direction?: "row" | "col"
        gap?: number | string
        wrap?: boolean
        justify?: "start" | "center" | "end" | "between"
        align?: "start" | "center" | "end"
      }
      "a-grid": CEProps<GridElement> & {
        "cols-lg"?: number
        "cols-md"?: number
        "cols-sm"?: number
        "cols-xs"?: number
        gap?: string
        "card-aspect"?: string
      }
      "a-container": CEProps<ContainerElement>

      // ── Typography ───────────────────────────────────────────────────────
      "a-head": CEProps<HeadingElement> & {
        level?: "1" | "2" | "3" | "4" | "5" | "6"
      }
      "a-text": CEProps<TextElement> & {
        variant?: "title" | "lead" | "body" | "small" | "muted"
        size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl"
      }

      // ── Icon ─────────────────────────────────────────────────────────────
      "a-icon": CEProps<IconElement> & {
        name?: string
        src?: string
        size?: "sm" | "md" | "lg"
        label?: string
      }

      // ── Popover ──────────────────────────────────────────────────────────
      "a-popover": CEProps<PopoverElement> & {
        open?: boolean
        side?: "top" | "right" | "bottom" | "left"
        align?: "start" | "center" | "end"
        sideOffset?: number
      }

      // ── Hover Card ───────────────────────────────────────────────────────
      "a-hover-card": CEProps<HoverCardElement> & {
        openDelay?: number
        closeDelay?: number
        side?: "top" | "bottom" | "left" | "right"
      }
      "a-hover-card-trigger": CEProps<HoverCardTriggerElement>
      "a-hover-card-content": CEProps<HoverCardContentElement>

      // ── Collapse ─────────────────────────────────────────────────────────
      "a-collapse": CEProps<CollapseElement> & {
        open?: boolean
      }

      // ── Tooltip ──────────────────────────────────────────────────────────
      "a-tooltip": CEProps<TooltipElement> & {
        content?: string
        side?: "top" | "bottom" | "left" | "right"
        sideOffset?: number
        openDelay?: number
        closeDelay?: number
      }
    }
  }
}
