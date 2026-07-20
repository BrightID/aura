import { css, type CSSResult } from 'lit'

/**
 * Base styles shared by every verification widget component.
 *
 * Because each component renders into its own shadow root, these rules must be
 * included in that component's `static styles` array to take effect — e.g.
 * `static styles = [widgetBase, css\`…\`]`.
 *
 * Provides, consistently across the whole widget:
 *  - keyboard focus rings (`:focus-visible`) on all interactive elements,
 *  - a subtle press affordance on buttons,
 *  - honouring of the user's reduced-motion preference.
 */
export const widgetBase: CSSResult = css`
  /* Keyboard focus — visible for keyboard users, invisible on mouse click. */
  button:focus-visible,
  a:focus-visible,
  [tabindex]:focus-visible,
  input:focus-visible,
  select:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
    border-radius: var(--radius, 0.5em);
  }

  /* Tactile press feedback (transform only — never reflows layout). */
  button:active:not(:disabled) {
    transform: scale(0.985);
  }

  /* Respect users who prefer less motion. */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.001ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.001ms !important;
      scroll-behavior: auto !important;
    }
  }
`
