import { A } from '@solidjs/router';
import type { JSX } from 'solid-js';
import { Show } from 'solid-js';
import Icon from '@/components/ui/icon';

/** A settings row card — either a link (href) or a button (onClick). */
export default function SettingCard(props: {
  icon?: string;
  label?: string;
  href?: string;
  external?: boolean;
  onClick?: () => void;
  testid?: string;
  children?: JSX.Element;
}) {
  const card = (
    <div
      class="a-card flex items-center gap-3 rounded-lg py-3.5 pl-5 pr-4"
      data-interactive
      data-testid={props.testid}
      onClick={props.onClick}
    >
      <Show when={props.icon}>{(icon) => <Icon name={icon()} />}</Show>
      <Show when={props.label}>
        <span class="text-base font-medium">{props.label}</span>
      </Show>
      {props.children}
    </div>
  );

  return (
    <Show when={props.href} fallback={card}>
      <Show
        when={props.external}
        fallback={
          // internal route → client-side navigation
          <A href={props.href!} class="block">
            {card}
          </A>
        }
      >
        <a href={props.href} target="_blank" rel="noreferrer" class="block">
          {card}
        </a>
      </Show>
    </Show>
  );
}
