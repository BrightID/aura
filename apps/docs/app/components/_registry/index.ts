import { badge } from "./badge";
import { button } from "./button";
import { card } from "./card";
import { input } from "./input";
import { separator } from "./separator";
import { text } from "./text";
import type { ComponentDoc } from "./types";

/** Ordered list of documented components — drives nav, index, and static params. */
export const registry: ComponentDoc[] = [button, badge, card, input, text, separator];

export function getComponent(slug: string): ComponentDoc | undefined {
  return registry.find((c) => c.slug === slug);
}

export type { ComponentDoc, PropSpec, CssVarSpec } from "./types";
