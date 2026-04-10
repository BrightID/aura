import 'react'
import type {
  BadgeElement,
  ButtonElement,
  CardElement,
  CollapseElement,
  ContainerElement,
  DialogElement,
  FlexElement,
  GridElement,
  HeadingElement,
  HoverCardElement,
  HoverCardTriggerElement,
  HoverCardContentElement,
  IconElement,
  InputElement,
  PopoverElement,
  ScrollAreaElement,
  SeparatorElement,
  TabsElement,
  TabElement,
  TabPanelElement,
  TextElement,
  ThemeProvider,
  ToasterElement,
} from '@aura/ui'

/**
 * Base props for every @aura/ui custom element.
 * React.HTMLAttributes already provides `className`, `style`, `onClick`, etc.
 * `ref` and `slot` are added for web-component-specific needs.
 */
type CEProps<T extends HTMLElement> = React.HTMLAttributes<T> & {
  ref?: React.Ref<T>
  slot?: string
  key?: React.Key
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      // ── Theme ────────────────────────────────────────────────────────────
      'a-theme-provider': CEProps<ThemeProvider>

      // ── Toaster ──────────────────────────────────────────────────────────
      'a-toaster': CEProps<ToasterElement>

      // ── Button ───────────────────────────────────────────────────────────
      'a-button': CEProps<ButtonElement> & {
        variant?: 'default' | 'secondary' | 'ghost'
        size?: 'sm' | 'md' | 'lg'
        color?: 'primary' | 'secondary' | 'success' | 'warning' | 'destructive'
        disabled?: boolean
      }

      // ── Card ─────────────────────────────────────────────────────────────
      'a-card': CEProps<CardElement> & {
        variant?: 'default' | 'glass'
      }

      // ── Badge ────────────────────────────────────────────────────────────
      'a-badge': CEProps<BadgeElement> & {
        variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'accent' | 'glass'
        size?: 'xs' | 'sm' | 'md' | 'lg'
        rounded?: boolean
        removable?: boolean
      }

      // ── Dialog ───────────────────────────────────────────────────────────
      // Events: listen to 'open-change' (CustomEvent<{open:boolean}>) via ref
      'a-dialog': CEProps<DialogElement> & {
        open?: boolean
      }

      // ── Input ────────────────────────────────────────────────────────────
      // Events: listen to 'change' (CustomEvent<string>) via ref
      'a-input': CEProps<InputElement> & {
        type?: 'text' | 'email' | 'password' | 'number'
        label?: string
        name?: string
        placeholder?: string
        value?: string
        disabled?: boolean
      }

      // ── Separator ────────────────────────────────────────────────────────
      'a-separator': CEProps<SeparatorElement>

      // ── Tabs ─────────────────────────────────────────────────────────────
      // Events: listen to 'change' (CustomEvent<{value:string}>) via ref
      'a-tabs': CEProps<TabsElement> & {
        value?: string
      }
      'a-tab': CEProps<TabElement> & {
        value?: string
      }
      'a-tab-panel': CEProps<TabPanelElement> & {
        value?: string
      }

      // ── Scroll Area ──────────────────────────────────────────────────────
      'a-scroll-area': CEProps<ScrollAreaElement> & {
        direction?: 'vertical' | 'horizontal' | 'both'
      }

      // ── Layout ───────────────────────────────────────────────────────────
      'a-flex': CEProps<FlexElement> & {
        direction?: 'row' | 'col'
        gap?: number | string
        wrap?: boolean
        justify?: 'start' | 'center' | 'end' | 'between'
        align?: 'start' | 'center' | 'end'
      }
      'a-grid': CEProps<GridElement> & {
        'cols-lg'?: number
        'cols-md'?: number
        'cols-sm'?: number
        'cols-xs'?: number
        gap?: string
        'card-aspect'?: string
      }
      'a-container': CEProps<ContainerElement>

      // ── Typography ───────────────────────────────────────────────────────
      'a-head': CEProps<HeadingElement> & {
        level?: '1' | '2' | '3' | '4' | '5' | '6'
      }
      'a-text': CEProps<TextElement> & {
        variant?: 'title' | 'lead' | 'body' | 'small' | 'muted'
      }

      // ── Icon ─────────────────────────────────────────────────────────────
      'a-icon': CEProps<IconElement> & {
        name?: string
        src?: string
        size?: 'sm' | 'md' | 'lg'
        label?: string
      }

      // ── Popover ──────────────────────────────────────────────────────────
      'a-popover': CEProps<PopoverElement> & {
        open?: boolean
        side?: 'top' | 'right' | 'bottom' | 'left'
        align?: 'start' | 'center' | 'end'
        sideOffset?: number
      }

      // ── Hover Card ───────────────────────────────────────────────────────
      'a-hover-card': CEProps<HoverCardElement> & {
        openDelay?: number
        closeDelay?: number
        side?: 'top' | 'bottom' | 'left' | 'right'
      }
      'a-hover-card-trigger': CEProps<HoverCardTriggerElement>
      'a-hover-card-content': CEProps<HoverCardContentElement>

      // ── Collapse ─────────────────────────────────────────────────────────
      'a-collapse': CEProps<CollapseElement> & {
        open?: boolean
      }
    }
  }
}
