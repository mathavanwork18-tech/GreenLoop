export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return 'Free / Grant'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatCoins(coins: number | undefined): string {
  return (coins || 0).toLocaleString('en-IN')
}

export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)}m away`
  return `${distanceKm.toFixed(1)} km away`
}

export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}
