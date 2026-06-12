/**
 * App version. Simplified from the source — no PWA/service-worker update flow
 * yet (the old card checked `/versioning.txt` and prompted a SW update).
 */
export default function VersionCard() {
  return (
    <a-card
      variant="glass"
      class="flex items-center justify-between gap-2 rounded-lg py-3.5 pl-5 pr-4"
    >
      <div>
        <div class="flex items-center gap-3">
          <a-icon name="refresh-cw" />
          <span class="text-xl font-medium">Aura</span>
        </div>
        <p class="mt-2 text-sm text-muted-foreground" data-testid="app-version">
          You are using version {__APP_VERSION__}
        </p>
      </div>
    </a-card>
  )
}
