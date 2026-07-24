import type * as React from "react"
import type {
  AlertDialogElement,
  AlertElement,
  AvatarElement,
  AvatarSize,
  BadgeElement,
  ButtonColors,
  ButtonElement,
  ButtonSize,
  ButtonVariant,
  CardElement,
  CheckboxElement,
  CollapseElement,
  ColorPickerElement,
  ContainerElement,
  DialogElement,
  DropdownItemElement,
  DropdownLabelElement,
  DropdownMenuElement,
  DropdownSeparatorElement,
  FlexElement,
  GridElement,
  HeadingElement,
  HoverCardContentElement,
  HoverCardElement,
  HoverCardTriggerElement,
  IconElement,
  InputElement,
  LabelElement,
  PopoverElement,
  ProgressElement,
  RadioElement,
  RadioGroupElement,
  ScrollAreaElement,
  SelectElement,
  SelectOption,
  SeparatorElement,
  SheetElement,
  SheetSide,
  SkeletonElement,
  SliderElement,
  SwitchElement,
  TabElement,
  TabPanelElement,
  TabsElement,
  TextareaElement,
  TextElement,
  ThemeProvider,
  ToasterElement,
  ToggleElement,
  ToggleGroupElement,
  ToggleGroupType,
  ToggleSize,
  ToggleVariant,
  TooltipElement,
} from "../index"

export type TypedCustomEvent<
  T extends EventTarget = EventTarget,
  D = unknown,
> = CustomEvent<D> & {
  target: T
  currentTarget: T
}

/**
 * Base props allowed on any `a-*` custom element in React 19. React 19 renders
 * unknown JSX elements as custom elements: string/number/boolean props are set
 * as attributes, and props matching a DOM property on the element instance are
 * set as properties. We expose `class` (the Lit-reflected attribute the
 * components read) alongside React's native `className`.
 */
export type CEProps<T> = React.HTMLAttributes<HTMLElement> & {
  key?: React.Key | null
  ref?: React.Ref<T | HTMLElement>
  slot?: string
  class?: string
  part?: string
}

/**
 * React JSX typings for every `a-*` custom element shipped by `@aura/ui`.
 * Mirrors `@aura/ui/jsx/solid`. Consuming React apps augment `react`'s
 * `JSX.IntrinsicElements` themselves for any app-only elements — `declare
 * module` blocks merge across files in the same TS program.
 */
declare module "react" {
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

      // ── Select ───────────────────────────────────────────────────────────
      // Events: listen to 'change' (CustomEvent<string>) via ref
      "a-select": CEProps<SelectElement> & {
        label?: string
        name?: string
        value?: string
        placeholder?: string
        disabled?: boolean
        options?: SelectOption[]
      }

      // ── Switch ───────────────────────────────────────────────────────────
      // Events: listen to 'change' (CustomEvent<boolean>) via ref
      "a-switch": CEProps<SwitchElement> & {
        checked?: boolean
        disabled?: boolean
        name?: string
        label?: string
      }

      // ── Color Picker ─────────────────────────────────────────────────────
      "a-color-picker": CEProps<ColorPickerElement> & {
        value?: string
        label?: string
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

      // ── Label ────────────────────────────────────────────────────────────
      "a-label": CEProps<LabelElement> & {
        for?: string
      }

      // ── Textarea ─────────────────────────────────────────────────────────
      // Events: listen to 'change' (CustomEvent<string>) via ref
      "a-textarea": CEProps<TextareaElement> & {
        label?: string
        name?: string
        placeholder?: string
        rows?: number
        value?: string
        disabled?: boolean
      }

      // ── Skeleton ─────────────────────────────────────────────────────────
      "a-skeleton": CEProps<SkeletonElement>

      // ── Progress ─────────────────────────────────────────────────────────
      "a-progress": CEProps<ProgressElement> & {
        value?: number
      }

      // ── Avatar ───────────────────────────────────────────────────────────
      "a-avatar": CEProps<AvatarElement> & {
        src?: string
        alt?: string
        fallback?: string
        size?: AvatarSize
      }

      // ── Checkbox ─────────────────────────────────────────────────────────
      // Events: listen to 'change' (CustomEvent<boolean>) via ref
      "a-checkbox": CEProps<CheckboxElement> & {
        checked?: boolean
        disabled?: boolean
        name?: string
        value?: string
      }

      // ── Radio Group ──────────────────────────────────────────────────────
      // Events: listen to 'change' (CustomEvent<string>) via ref on the group
      "a-radio-group": CEProps<RadioGroupElement> & {
        value?: string
        name?: string
        disabled?: boolean
      }
      "a-radio": CEProps<RadioElement> & {
        value?: string
        checked?: boolean
        disabled?: boolean
      }

      // ── Slider ───────────────────────────────────────────────────────────
      // Events: listen to 'change' (CustomEvent<number>) via ref
      "a-slider": CEProps<SliderElement> & {
        value?: number
        min?: number
        max?: number
        step?: number
        disabled?: boolean
      }

      // ── Toggle ───────────────────────────────────────────────────────────
      // Events: listen to 'change' (CustomEvent<boolean>) via ref
      "a-toggle": CEProps<ToggleElement> & {
        pressed?: boolean
        disabled?: boolean
        variant?: ToggleVariant
        size?: ToggleSize
        value?: string
      }

      // ── Toggle Group ─────────────────────────────────────────────────────
      // Events: listen to 'change' (CustomEvent<string | string[]>) via ref
      "a-toggle-group": CEProps<ToggleGroupElement> & {
        value?: string
        type?: ToggleGroupType
        disabled?: boolean
      }

      // ── Alert ────────────────────────────────────────────────────────────
      "a-alert": CEProps<AlertElement> & {
        variant?: "default" | "destructive"
      }

      // ── Alert Dialog ─────────────────────────────────────────────────────
      // Events: listen to 'open-change' (CustomEvent<{open:boolean}>) via ref
      "a-alert-dialog": CEProps<AlertDialogElement> & {
        open?: boolean
      }

      // ── Sheet ────────────────────────────────────────────────────────────
      // Events: listen to 'open-change' (CustomEvent<{open:boolean}>) via ref
      "a-sheet": CEProps<SheetElement> & {
        open?: boolean
        side?: SheetSide
      }

      // ── Dropdown Menu ────────────────────────────────────────────────────
      // Events: listen to 'open-change' on the root, 'select' on items, via ref
      "a-dropdown-menu": CEProps<DropdownMenuElement> & {
        open?: boolean
        side?: "top" | "right" | "bottom" | "left"
        align?: "start" | "center" | "end"
        sideOffset?: number
      }
      "a-dropdown-item": CEProps<DropdownItemElement> & {
        disabled?: boolean
        variant?: "default" | "destructive"
      }
      "a-dropdown-label": CEProps<DropdownLabelElement>
      "a-dropdown-separator": CEProps<DropdownSeparatorElement>
    }
  }
}
