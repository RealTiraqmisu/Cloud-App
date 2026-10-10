export const STATUS = {
  PENDING: 'PENDING',
  QUEUED: 'QUEUED',
  PREPARING: 'PREPARING',
  READY: 'READY',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
}

export const STATUS_LABEL = {
  PENDING: 'รอเข้าคิว',
  QUEUED: 'อยู่ในคิว',
  PREPARING: 'กำลังทำ',
  READY: 'อาหารพร้อม',
  COMPLETED: 'รับอาหารแล้ว',
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

// Customer-facing progress steps (CANCELLED is shown separately).
export const PROGRESS_STEPS = ['PENDING', 'QUEUED', 'PREPARING', 'READY', 'COMPLETED']

export const FINAL_STATUSES = ['COMPLETED', 'CANCELLED']

export const CANCELLABLE_STATUSES = ['PENDING', 'QUEUED']
