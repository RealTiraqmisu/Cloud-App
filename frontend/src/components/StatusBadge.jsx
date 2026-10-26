import { Ban, Check, CheckCheck, Clock, Flame, Send } from 'lucide-react'
import { STATUS_LABEL } from '../constants'

const ICONS = {
  PENDING: Send,
  QUEUED: Clock,
  PREPARING: Flame,
  READY: Check,
  COMPLETED: CheckCheck,
  CANCELLED: Ban,
}

export default function StatusBadge({ status }) {
  const Icon = ICONS[status] ?? Clock
  return (
    <span className={`badge badge-${status.toLowerCase()}`}>
      <Icon size={15} strokeWidth={2.25} aria-hidden="true" />
      {STATUS_LABEL[status] ?? status}
    </span>
  )
}
