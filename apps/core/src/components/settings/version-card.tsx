import Icon from '@/components/ui/icon';
export default function VersionCard() {
  return (
    <div
      class="a-card flex items-center justify-between gap-2 rounded-lg py-3.5 pl-5 pr-4"
      data-variant="glass"
    >
      <div>
        <div class="flex items-center gap-3">
          <Icon name="refresh-cw" />
          <span class="text-xl font-medium">Aura</span>
        </div>
        <p class="mt-2 text-sm text-muted-foreground" data-testid="app-version">
          You are using version {__APP_VERSION__}
        </p>
      </div>
    </div>
  );
}
