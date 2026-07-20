export default function ProgressBar(props: {
  percentage: number
  class?: string
}) {
  const pct = () => Math.max(0, Math.min(100, props.percentage))
  return (
    <div
      class={`h-2 overflow-hidden rounded-full bg-foreground/10 ${props.class ?? ""}`}
    >
      <div
        class="h-full rounded-full bg-primary transition-all"
        style={{ width: `${pct()}%` }}
      />
    </div>
  )
}
