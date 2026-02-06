export function AuraLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-label="Aura logo"
    >
      <circle
        cx="16"
        cy="16"
        r="14"
        stroke="#a0dba0"
        strokeWidth="2"
        opacity="0.4"
      />
      <circle
        cx="16"
        cy="16"
        r="10"
        stroke="#c8e6c8"
        strokeWidth="2"
        opacity="0.6"
      />
      <circle cx="16" cy="16" r="6" fill="#ffd700" />
      <circle cx="16" cy="16" r="3" fill="#ff8c00" />
    </svg>
  )
}
