const priceFormatter = new Intl.NumberFormat('th-TH', { maximumFractionDigits: 2 })

export function formatPrice(value) {
  return `฿${priceFormatter.format(Number(value) || 0)}`
}

export function formatTime(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
}

export function minutesSince(iso, now = Date.now()) {
  if (!iso) return 0
  return Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60000))
}

export function timeAgo(iso, now = Date.now()) {
  const mins = minutesSince(iso, now)
  if (mins < 1) return 'เมื่อสักครู่'
  if (mins < 60) return `${mins} นาทีที่แล้ว`
  return `${Math.floor(mins / 60)} ชม. ${mins % 60} นาทีที่แล้ว`
}

// "ข้าวกะเพรา ×2, ชาไทย" — short one-line summary of an order's items.
export function itemsSummary(items = []) {
  return items.map((i) => (i.qty > 1 ? `${i.name} ×${i.qty}` : i.name)).join(', ')
}
