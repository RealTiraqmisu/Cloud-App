export const STATUS = {
  PENDING: 'PENDING',
  QUEUED: 'QUEUED',
  PREPARING: 'PREPARING',
  READY: 'READY',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
}

// Counter pickup: once READY the customer collects the food at the counter by queue number.
export const STATUS_LABEL = {
  PENDING: 'กำลังส่งเข้าคิว',
  QUEUED: 'รอคิว',
  PREPARING: 'กำลังทำ',
  READY: 'พร้อมรับ',
  COMPLETED: 'รับแล้ว',
  CANCELLED: 'ยกเลิกแล้ว',
}

// Allowed transitions — must match the Lambda (see docs/API.md).
export const NEXT_STATUS = {
  PENDING: ['QUEUED', 'CANCELLED'],
  QUEUED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY'],
  READY: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
}

// Customer-facing route: PENDING is the in-between moment before the first stop.
export const ROUTE_STOPS = [
  { status: 'QUEUED', label: 'เข้าคิวแล้ว', sub: 'ได้เลขคิว รอครัวเริ่มทำ' },
  { status: 'PREPARING', label: 'กำลังทำ', sub: 'ครัวกำลังปรุงอาหารของคุณ' },
  { status: 'READY', label: 'พร้อมรับ', sub: 'มารับที่เคาน์เตอร์ได้เลย' },
  { status: 'COMPLETED', label: 'รับแล้ว', sub: 'ขอให้อร่อย' },
]

export const FINAL_STATUSES = ['COMPLETED', 'CANCELLED']

export const CANCELLABLE_STATUSES = ['PENDING', 'QUEUED']

// Kitchen ticket ageing (minutes since the order was placed).
export const KITCHEN_WARN_MINUTES = 10
export const KITCHEN_LATE_MINUTES = 15
// Ready food waiting at the counter gets cold fast, so it ages on a shorter clock.
export const READY_WARN_MINUTES = 3
export const READY_LATE_MINUTES = 5
