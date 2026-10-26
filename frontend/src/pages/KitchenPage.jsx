import { Bell, BellOff, BellRing, Check, CircleAlert, Clock, Flame, Hourglass, LoaderCircle, MessageSquareText, RefreshCw, TriangleAlert } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { api } from '../api'
import QueuePlate from '../components/QueuePlate'
import { KITCHEN_LATE_MINUTES, KITCHEN_WARN_MINUTES, READY_LATE_MINUTES, READY_WARN_MINUTES } from '../constants'
import { usePolling } from '../hooks/usePolling'
import { formatTime, minutesSince } from '../utils/format'
import { playChime, unlockAudio } from '../utils/notify'

const COLUMNS = [
  { key: 'queue', title: 'คิวใหม่', statuses: ['PENDING', 'QUEUED'], empty: 'ยังไม่มีออเดอร์ใหม่' },
  { key: 'cooking', title: 'กำลังทำ', statuses: ['PREPARING'], empty: 'ยังไม่มีจานที่กำลังทำ' },
  { key: 'ready', title: 'รอเสิร์ฟ', statuses: ['READY'], empty: 'ไม่มีจานรอเสิร์ฟ' },
]

const ACTIVE_STATUSES = COLUMNS.flatMap((c) => c.statuses)

const PRIMARY_ACTION = {
  QUEUED: { to: 'PREPARING', label: 'เริ่มทำ', Icon: Flame },
  PREPARING: { to: 'READY', label: 'อาหารพร้อม', Icon: BellRing },
  READY: { to: 'COMPLETED', label: 'เสิร์ฟแล้ว', Icon: Check },
}

export default function KitchenPage() {
  const [busy, setBusy] = useState({})
  const [actionError, setActionError] = useState(null)
  const [soundOn, setSoundOn] = useState(true)
  const [tab, setTab] = useState('queue')
  const [now, setNow] = useState(() => Date.now())
  const [updatedAt, setUpdatedAt] = useState(null)
  const seenQueued = useRef(null)
  const { data: orders, error, loading, refresh } = usePolling(async () => {
    const list = await api.listOrders(ACTIVE_STATUSES)
    setUpdatedAt(new Date().toISOString())
    setNow(Date.now())
    return list
  })

  // Re-render every 30s so the waiting-time counters stay fresh.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!orders) return
    // Chime when a new order reaches QUEUED (skip the first load).
    const queued = new Set(orders.filter((o) => o.status === 'QUEUED').map((o) => o.orderId))
    if (seenQueued.current && soundOn && [...queued].some((id) => !seenQueued.current.has(id))) playChime()
    seenQueued.current = queued
  }, [orders, soundOn])

  function toggleSound() {
    if (!soundOn) unlockAudio()
    setSoundOn((on) => !on)
  }

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

  const byColumn = Object.fromEntries(
    COLUMNS.map((col) => [col.key, (orders ?? []).filter((o) => col.statuses.includes(o.status))]),
  )

  return (
    <div className="page">
      <div className="board-head">
        <div>
          <h1>หน้าจอครัว</h1>
          <p>
            <RefreshCw size={14} aria-hidden="true" />
            {updatedAt ? `อัปเดตล่าสุด ${formatTime(updatedAt)} · เรียงจากออเดอร์ที่รอนานสุด` : 'กำลังโหลดออเดอร์…'}
          </p>
        </div>
        <div className="board-tools">
          <button type="button" className="btn btn-board" aria-pressed={soundOn} onClick={toggleSound}>
            {soundOn ? <Bell size={18} aria-hidden="true" /> : <BellOff size={18} aria-hidden="true" />}
            {soundOn ? 'เสียงเตือนเปิดอยู่' : 'เสียงเตือนปิดอยู่'}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-warn" role="status">
          <RefreshCw size={18} aria-hidden="true" />
          <span>เชื่อมต่อไม่ได้ชั่วคราว กำลังลองใหม่อัตโนมัติ ({error.message})</span>
        </div>
      )}
      {actionError && (
        <div className="alert alert-error" role="alert">
          <CircleAlert size={18} aria-hidden="true" />
          <span>{actionError}</span>
        </div>
      )}

      <div className="board-tabs" role="tablist" aria-label="คอลัมน์ออเดอร์">
        {COLUMNS.map((col) => (
          <button
            key={col.key}
            type="button"
            role="tab"
            id={`tab-${col.key}`}
            aria-controls={`col-${col.key}`}
            aria-selected={tab === col.key}
            className="board-tab"
            onClick={() => setTab(col.key)}
          >
            {col.title}
            <span className="count">{byColumn[col.key].length}</span>
          </button>
        ))}
      </div>

      <div className="board-columns">
        {COLUMNS.map((col) => {
          const list = byColumn[col.key]
          return (
            <section
              key={col.key}
              id={`col-${col.key}`}
              className="board-col"
              hidden={tab !== col.key}
              aria-labelledby={`col-title-${col.key}`}
            >
              <div className="board-col-head">
                <h2 id={`col-title-${col.key}`}>{col.title}</h2>
                <span className="plate plate-sm" aria-label={`${list.length} ออเดอร์`}>
                  {list.length}
                </span>
              </div>
              {loading && !orders && <div className="ticket skeleton" style={{ height: 180, opacity: 0.25 }} />}
              {orders && list.length === 0 && <p className="board-col-empty">{col.empty}</p>}
              <div className="tickets">
                {list.map((o) => (
                  <KitchenTicket key={o.orderId} order={o} now={now} busy={!!busy[o.orderId]} onMove={move} />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

function KitchenTicket({ order, now, busy, onMove }) {
  const [confirming, setConfirming] = useState(false)
  const isReady = order.status === 'READY'
  // Ready tickets age from the moment the food was ready; the rest from when it was ordered.
  const since = isReady ? (order.statusHistory?.findLast((h) => h.status === 'READY')?.at ?? order.updatedAt) : order.createdAt
  const waited = minutesSince(since, now)
  const action = PRIMARY_ACTION[order.status]
  const pending = order.status === 'PENDING'
  const late = waited >= (isReady ? READY_LATE_MINUTES : KITCHEN_LATE_MINUTES)
  const warn = !late && waited >= (isReady ? READY_WARN_MINUTES : KITCHEN_WARN_MINUTES)

  // The cancel confirmation quietly expires so a stray tap never sticks around.
  useEffect(() => {
    if (!confirming) return undefined
    const id = setTimeout(() => setConfirming(false), 5000)
    return () => clearTimeout(id)
  }, [confirming])

  return (
    <article className={`ticket${pending ? ' is-pending' : ''}`} aria-label={`คิว ${order.queueNumber ?? 'รอเลข'}`}>
      <div className="ticket-head">
        <QueuePlate number={order.queueNumber} size="kds" />
        <div className="ticket-who">
          <div className="ticket-table">{order.tableNumber ? `โต๊ะ ${order.tableNumber}` : 'ไม่ระบุโต๊ะ'}</div>
          <div className="ticket-name">
            {order.customerName} · สั่ง {formatTime(order.createdAt)}
          </div>
        </div>
        {!pending && (
          <span
            className={`ticket-age${late ? ' is-late' : warn ? ' is-warn' : ''}`}
            title={isReady ? 'อาหารพร้อมมาแล้ว' : 'รอมาแล้วตั้งแต่สั่ง'}
          >
            {late ? (
              <TriangleAlert size={16} aria-hidden="true" />
            ) : warn ? (
              <Hourglass size={16} aria-hidden="true" />
            ) : (
              <Clock size={16} aria-hidden="true" />
            )}
            {isReady ? `พร้อมมา ${waited} นาที` : `${waited} นาที`}
            {late && <span className="visually-hidden">เกินเวลา</span>}
          </span>
        )}
      </div>

      <ul className="ticket-items">
        {order.items.map((i) => (
          <li key={i.menuId}>
            <span className="qty">{i.qty}×</span>
            <span>{i.name}</span>
          </li>
        ))}
      </ul>

      {order.note && (
        <div className="ticket-note">
          <MessageSquareText size={18} aria-hidden="true" />
          <span>{order.note}</span>
        </div>
      )}

      {pending ? (
        <div className="ticket-wait">
          <LoaderCircle size={16} className="spin" aria-hidden="true" />
          กำลังรับเข้าคิว…
        </div>
      ) : (
        <div className="ticket-actions">
          {action && !confirming && (
            <button type="button" className="btn btn-primary btn-lg" disabled={busy} onClick={() => onMove(order, action.to)}>
              {busy ? <LoaderCircle size={20} className="spin" aria-hidden="true" /> : <action.Icon size={20} aria-hidden="true" />}
              {action.label}
            </button>
          )}
          {order.status === 'QUEUED' && (
            <div className="ticket-cancel-row">
              {confirming ? (
                <>
                  <button type="button" className="btn" onClick={() => setConfirming(false)}>
                    ไม่ยกเลิก
                  </button>
                  <button type="button" className="btn btn-danger" disabled={busy} onClick={() => onMove(order, 'CANCELLED')}>
                    ยืนยันยกเลิกคิว {order.queueNumber}
                  </button>
                </>
              ) : (
                <button type="button" className="btn btn-danger-quiet" disabled={busy} onClick={() => setConfirming(true)}>
                  ยกเลิกออเดอร์
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  )
}
