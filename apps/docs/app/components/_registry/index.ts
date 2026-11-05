import { badge } from './badge';
import { button } from './button';
import { card } from './card';
import { input } from './input';
import { separator } from './separator';
import { text } from './text';
import {
  headDoc,
  labelDoc,
  fieldDoc,
  inputGroupDoc,
  switchDoc,
  sliderDoc,
  toggleDoc,
  tabsDoc,
  skeletonDoc,
  progressDoc,
  avatarDoc,
  dialogDoc,
  sheetDoc,
  menuDoc,
  popoverDoc,
  toastDoc,
} from './elements';
import type { ComponentDoc } from './types';

export const registry: ComponentDoc[] = [
  button,
  toggleDoc,
  badge,
  card,
  input,
  fieldDoc,
  inputGroupDoc,
  labelDoc,
  switchDoc,
  sliderDoc,
  text,
  headDoc,
  separator,
  tabsDoc,
  dialogDoc,
  sheetDoc,
  menuDoc,
  popoverDoc,
  toastDoc,
  skeletonDoc,
  progressDoc,
  avatarDoc,
];

export function getComponent(slug: string): ComponentDoc | undefined {
  return registry.find((c) => c.slug === slug);
}

export type { ComponentDoc, CssVarSpec, PropSpec } from './types';
