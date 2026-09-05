import Avatar from '@/components/home/avatar';
import { formatDuration } from '@/shared/lib/time';
import type { AuraNodeBrightIdConnection } from '@aura/domain/types/aura';

/** Inbound-connection row: who, how close, and since when. */
export default function ConnectionCard(props: {
  connection: AuraNodeBrightIdConnection;
  name: string;
  onClick?: (id: string) => void;
}) {
  return (
    <a-card
      interactive
      data-testid={`connection-card-${props.connection.id}`}
      class="flex w-full items-center justify-between gap-2 p-4"
      onClick={() => props.onClick?.(props.connection.id)}
    >
      <div class="flex items-center gap-3">
        <Avatar
          name={props.name}
          subjectId={props.connection.id}
          class="h-12 w-12"
        />
        <div class="flex flex-col">
          <p class="font-medium text-foreground">{props.name}</p>
          <p class="text-sm text-muted-foreground">
            {formatDuration(props.connection.timestamp)}
          </p>
        </div>
      </div>
      <span class="text-sm capitalize text-muted-foreground">
        {props.connection.level}
      </span>
    </a-card>
  );
}
