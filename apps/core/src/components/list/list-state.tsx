import { type JSX, Show } from 'solid-js';
import ListSkeleton from '@/components/list/list-skeleton';

export default function ListState(props: {
  loading: boolean;
  empty: boolean;
  emptyText: string;
  children: JSX.Element;
  /** Override the loading placeholder (defaults to skeleton rows). */
  skeleton?: JSX.Element;
  error?: boolean;
  /** The failure view prints errorText as typed. Pass a sentence for the user, not an exception message. */
  errorText?: string;
}) {
  return (
    <Show when={!props.loading} fallback={props.skeleton ?? <ListSkeleton />}>
      <Show
        when={!props.error}
        fallback={
          <div class="flex flex-col items-center gap-2 py-10 text-center">
            <a-icon name="circle-alert" class="text-2xl text-destructive" />
            <span class="text-sm text-foreground">
              {props.errorText ?? 'Something went wrong. Try again.'}
            </span>
          </div>
        }
      >
        <Show
          when={!props.empty}
          fallback={
            <div class="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
              <a-icon name="inbox" class="text-2xl opacity-60" />
              <span class="text-sm">{props.emptyText}</span>
            </div>
          }
        >
          {props.children}
        </Show>
      </Show>
    </Show>
  );
}
