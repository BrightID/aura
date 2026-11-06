import { describe, expect, test } from 'bun:test';
import { registry } from '../_registry';
import { liveProps } from './Playground';
import { initialState, toSnippet } from './snippet';

const doc = (slug: string) => registry.find((c) => c.slug === slug)!;

describe('toSnippet', () => {
  // toSnippet leaves out a data-* modifier at its default, but must keep a
  // native attribute at the default the docs give it: a <progress> without
  // value is indeterminate, not 60% full.
  test('keeps a native attribute set to its default', () => {
    const progress = doc('progress');
    expect(toSnippet(progress, initialState(progress))).toContain('value="60"');
  });

  test('omits a data-* modifier set to its default', () => {
    const button = doc('button');
    expect(toSnippet(button, initialState(button))).not.toContain(
      'data-variant',
    );
  });

  // React only reads defaultValue on form fields; on <progress> it would be
  // dropped and the preview would show an indeterminate bar.
  test('the live preview gives <progress> a value', () => {
    const progress = doc('progress');
    expect(liveProps(progress, initialState(progress)).value).toBe('60');
  });
});
