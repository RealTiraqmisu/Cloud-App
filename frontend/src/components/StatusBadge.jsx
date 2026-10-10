import { STATUS_LABEL } from '../constants'

export default function StatusBadge({ status }) {
  return <span className={`badge badge-${status.toLowerCase()}`}>{STATUS_LABEL[status] ?? status}</span>
}
