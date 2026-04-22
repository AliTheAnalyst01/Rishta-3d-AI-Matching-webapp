/** Convert any Google Drive share/open/view URL to a direct thumbnail URL */
export function gDriveThumb(url: string | null | undefined, size = 400): string | null {
  if (!url) return null
  if (url.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i)) return url
  const match = url.match(/(?:id=|\/d\/)([a-zA-Z0-9_-]{20,})/)
  if (!match) return null
  return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w${size}`
}

export function formatIncome(income: number | null | undefined): string | null {
  if (!income) return null
  if (income >= 100000) return `PKR ${(income / 100000).toFixed(1)}L/mo`
  return `PKR ${(income / 1000).toFixed(0)}K/mo`
}

export function formatHeight(cm: number | null | undefined): string | null {
  if (!cm) return null
  const totalIn = Math.round(cm / 2.54)
  return `${Math.floor(totalIn / 12)}'${totalIn % 12}" (${cm}cm)`
}
