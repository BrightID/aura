export function compactFormat(value: Parameters<Intl.NumberFormat['format']>[0]) {
  return Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(value)
}

export const toRoundedPercentage = (amount: number, total: number, decimals = 2) => {
  if (!total || !amount) return 0
  return Number(((Number(amount) / Number(total)) * 100).toFixed(decimals))
}
