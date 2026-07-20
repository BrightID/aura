import "@aura/ui"

import { badge } from "./badge"
import { button } from "./button"
import { card } from "./card"
import { input } from "./input"
import { separator } from "./separator"
import { text } from "./text"
import type { ComponentDoc } from "./types"

export const registry: ComponentDoc[] = [
  button,
  badge,
  card,
  input,
  text,
  separator,
]

export function getComponent(slug: string): ComponentDoc | undefined {
  return registry.find((c) => c.slug === slug)
}

export type { ComponentDoc, CssVarSpec, PropSpec } from "./types"
