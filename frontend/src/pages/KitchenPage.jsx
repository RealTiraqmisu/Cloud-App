import { useEffect, useRef, useState } from 'react'
import { api } from '../api'
import { usePolling } from '../hooks/usePolling'
import { formatTime, minutesSince } from '../utils/format'
import { playChime } from '../utils/notify'

const COLUMNS = [
  { key: 'queue', title: 'คิวใหม่', statuses: ['PENDING', 'QUEUED'] },
  { key: 'cooking', title: 'กำลังทำ', statuses: ['PREPARING'] },
  { key: 'ready', title: 'พร้อมเสิร์ฟ', statuses: ['READY'] },
]

const ACTIVE_STATUSES = COLUMNS.flatMap((c) => c.statuses)

const PRIMARY_ACTION = {
  QUEUED: { to: 'PREPARING', label: 'เริ่มทำ' },
  PREPARING: { to: 'READY', label: 'อาหารพร้อม 🔔' },
  READY: { to: 'COMPLETED', label: 'ลูกค้ารับแล้ว' },
}

export default function KitchenPage() {
  const { data: orders, error, loading, refresh } = usePolling(() => api.listOrders(ACTIVE_STATUSES))
  const [busy, setBusy] = useState({})
  const [actionError, setActionError] = useState(null)
  const [soundOn, setSoundOn] = useState(true)
  const [now, setNow] = useState(() => Date.now())
  const seenQueued = useRef(null)

  // Re-render every 30s so the "waiting N minutes" counters stay fresh.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(id)
  }, [])

  // Chime when a new order reaches QUEUED (skip the first load).
  useEffect(() => {
    if (!orders) return
    const queued = new Set(orders.filter((o) => o.status === 'QUEUED').map((o) => o.orderId))
    if (seenQueued.current && soundOn && [...queued].some((id) => !seenQueued.current.has(id))) playChime()
    seenQueued.current = queued
  }, [orders, soundOn])

  async function move(order, to) {
    setBusy((b) => ({ ...b, [order.orderId]: true }))
    setActionError(null)
    try {
      await api.updateOrderStatus(order.orderId, to)
      await refresh()
    } catch (err) {
      setActionError(`คิว ${order.queueNumber ?? order.orderId}: ${err.message}`)
      await refresh()
    } finally {
      setBusy((b) => ({ ...b, [order.orderId]: false }))
    }
  }

  return (
    <div>
      <div className="page-head row">
        <div>
          <h1>หน้าจอครัว</h1>
          <p className="muted">อัปเดตอัตโนมัติทุกไม่กี่วินาที · เรียงจากออเดอร์เก่าสุด</p>
        </div>
        <label className="toggle">
          <input type="checkbox" checked={soundOn} onChange={(e) => setSoundOn(e.target.checked)} />
          <span>เสียงเตือนออเดอร์ใหม่</span>
        </label>
      </div>

      {error && <div className="alert warn">เชื่อมต่อไม่ได้ชั่วคราว กำลังลองใหม่… ({error.message})</div>}
      {actionError && <div className="alert error">{actionError}</div>}

      <div className="kanban">
        {COLUMNS.map((col) => {
          const list = (orders ?? []).filter((o) => col.statuses.includes(o.status))
          return (
            <section key={col.key} className={`kanban-col col-${col.key}`}>
              <header>
                <h2>{col.title}</h2>
                <span className="count">{list.length}</span>
              </header>
              {loading && !orders && <div className="card skeleton" />}
              {orders && list.length === 0 && <p className="empty small">ว่าง</p>}
              {list.map((o) => (
                <KitchenTicket key={o.orderId} order={o} now={now} busy={!!busy[o.orderId]} onMove={move} />
              ))}
            </section>
          )
        })}
      </div>
    </div>
  )
}

function KitchenTicket({ order, now, busy, onMove }) {
  const waited = minutesSince(order.createdAt, now)
  const action = PRIMARY_ACTION[order.status]
  const pending = order.status === 'PENDING'

  return (
    <article className={`card ticket${pending ? ' ticket-pending' : ''}${waited >= 15 && !pending ? ' ticket-late' : ''}`}>
      <div className="ticket-head">
        <strong className="ticket-queue">#{order.queueNumber ?? '…'}</strong>
        <span className="muted small">
          {formatTime(order.createdAt)} · {waited} นาที
        </span>
      </div>
      <div className="small">{order.customerName}</div>
      <ul className="ticket-items">
        {order.items.map((i) => (
          <li key={i.menuId}>
            <strong>{i.qty}×</strong> {i.name}
          </li>
        ))}
      </ul>
      {order.note && <div className="ticket-note">📝 {order.note}</div>}

      {pending ? (
        <div className="muted small">รอระบบคิว (SQS) รับออเดอร์…</div>
      ) : (
        <div className="ticket-actions">
          {action && (
            <button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={() => onMove(order, action.to)}>
              {busy ? '…' : action.label}
            </button>
          )}
          {order.status === 'QUEUED' && (
            <button type="button" className="btn btn-danger-ghost btn-sm" disabled={busy} onClick={() => onMove(order, 'CANCELLED')}>
              ยกเลิก
            </button>
          )}
        </div>
      )}
    </article>
  )
}
