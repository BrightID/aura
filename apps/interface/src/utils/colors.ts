function adjustColor(color: string, amount: number) {
  // Remove '#' if present
  color = color.replace('#', '')

  // Parse hex to RGB
  const r = parseInt(color.slice(0, 2), 16)
  const g = parseInt(color.slice(2, 4), 16)
  const b = parseInt(color.slice(4, 6), 16)

  const newR = Math.min(255, Math.max(0, r + amount))
  const newG = Math.min(255, Math.max(0, g + amount))
  const newB = Math.min(255, Math.max(0, b + amount))

  // Convert back to hex
  return `#${Math.round(newR).toString(16).padStart(2, '0')}${Math.round(newG)
    .toString(16)
    .padStart(2, '0')}${Math.round(newB).toString(16).padStart(2, '0')}`
}

export { adjustColor }
