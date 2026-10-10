import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api'
import StatusBadge from '../components/StatusBadge'
import { CANCELLABLE_STATUSES, FINAL_STATUSES, PROGRESS_STEPS, STATUS_LABEL } from '../constants'
import { usePolling } from '../hooks/usePolling'
import { formatPrice, formatTime } from '../utils/format'
import {
  canUseBrowserNotification,
  playChime,
  requestBrowserNotification,
  showBrowserNotification,
} from '../utils/notify'

const STEP_HINT = {
  PENDING: 'กำลังส่งออเดอร์เข้าคิวครัว…',
  QUEUED: 'ออเดอร์อยู่ในคิวแล้ว รอครัวเริ่มทำ',
  PREPARING: 'ครัวกำลังทำอาหารของคุณ',
  READY: 'อาหารพร้อมแล้ว! มารับที่เคาน์เตอร์ได้เลย',
  COMPLETED: 'รับอาหารเรียบร้อย ขอบคุณที่ใช้บริการ',
  CANCELLED: 'ออเดอร์นี้ถูกยกเลิก',
}

export default function OrderTrackingPage() {
  const { orderId } = useParams()
  const { data: order, error, loading, setData } = usePolling(() => api.getOrder(orderId), {
    key: orderId,
    stopWhen: (o) => FINAL_STATUSES.includes(o.status),
  })
  const [readyDismissed, setReadyDismissed] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [actionError, setActionError] = useState(null)
  const [notifPermission, setNotifPermission] = useState(() =>
    canUseBrowserNotification() ? Notification.permission : 'unsupported',
  )
  const prevStatus = useRef(null)

  const status = order?.status
  const showReady = status === 'READY' && !readyDismissed

  useEffect(() => {
    if (!status) return
    // Only chime on a live transition, not when opening an already-ready order.
    if (status === 'READY' && prevStatus.current && prevStatus.current !== 'READY') {
      playChime()
      showBrowserNotification('อาหารพร้อมแล้ว! 🍽️', `คิวที่ ${order.queueNumber ?? '-'} มารับที่เคาน์เตอร์ได้เลย`)
    }
    prevStatus.current = status
  }, [status, order?.queueNumber])

  useEffect(() => {
    const original = document.title
    if (status === 'READY') document.title = '🔔 อาหารพร้อมแล้ว! — ครัวคลาวด์'
    return () => {
      document.title = original
    }
  }, [status])

  async function cancel() {
    setCancelling(true)
    setActionError(null)
    try {
      setData(await api.updateOrderStatus(orderId, 'CANCELLED'))
    } catch (err) {
      setActionError(err.message)
    } finally {
      setCancelling(false)
    }
  }

  async function enableNotifications() {
    setNotifPermission(await requestBrowserNotification())
  }

  if (loading && !order) return <div className="card tracking skeleton tall" />
  if (!order) {
    return (
      <div className="card tracking">
        <div className="alert error">{error?.status === 404 ? 'ไม่พบออเดอร์นี้' : `โหลดออเดอร์ไม่สำเร็จ: ${error?.message}`}</div>
        <Link to="/" className="btn">กลับไปหน้าเมนู</Link>
      </div>
    )
  }

  const currentStep = PROGRESS_STEPS.indexOf(status)
  const historyAt = Object.fromEntries(order.statusHistory.map((h) => [h.status, h.at]))

  return (
    <div className="tracking-layout">
      <section className={`card tracking status-${status.toLowerCase()}`}>
        <div className="tracking-head">
          <div>
            <div className="muted small">ออเดอร์ {order.orderId}</div>
            <h1>สวัสดีคุณ {order.customerName}</h1>
          </div>
          <StatusBadge status={status} />
        </div>

        <div className="queue-number">
          <span className="muted">เลขคิวของคุณ</span>
          <strong>{order.queueNumber ?? '…'}</strong>
        </div>

        <p className="tracking-hint">{STEP_HINT[status]}</p>

        {status !== 'CANCELLED' && (
          <ol className="steps">
            {PROGRESS_STEPS.map((s, i) => (
              <li key={s} className={i < currentStep ? 'done' : i === currentStep ? 'current' : ''}>
                <span className="step-dot">{i < currentStep ? '✓' : i + 1}</span>
                <span className="step-label">{STATUS_LABEL[s]}</span>
                <span className="step-time muted small">{historyAt[s] ? formatTime(historyAt[s]) : ''}</span>
              </li>
            ))}
          </ol>
        )}

        {error && <div className="alert warn small">เชื่อมต่อไม่ได้ชั่วคราว กำลังลองใหม่… ({error.message})</div>}
        {actionError && <div className="alert error small">{actionError}</div>}

        <div className="tracking-actions">
          {notifPermission === 'default' && !FINAL_STATUSES.includes(status) && (
            <button type="button" className="btn" onClick={enableNotifications}>
              🔔 เปิดแจ้งเตือนในเบราว์เซอร์
            </button>
          )}
          {CANCELLABLE_STATUSES.includes(status) && (
            <button type="button" className="btn btn-danger-ghost" onClick={cancel} disabled={cancelling}>
              {cancelling ? 'กำลังยกเลิก…' : 'ยกเลิกออเดอร์'}
            </button>
          )}
          {FINAL_STATUSES.includes(status) && (
            <Link to="/" className="btn btn-primary">สั่งอาหารเพิ่ม</Link>
          )}
        </div>
        {!FINAL_STATUSES.includes(status) && (
          <p className="muted small center">หน้านี้อัปเดตอัตโนมัติ — เปิดทิ้งไว้ได้เลย</p>
        )}
      </section>

      <aside className="card">
        <h2>รายการอาหาร</h2>
        <ul className="receipt">
          {order.items.map((i) => (
            <li key={i.menuId}>
              <span>{i.name} × {i.qty}</span>
              <span>{formatPrice(i.price * i.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="cart-total">
          <span>รวม</span>
          <strong>{formatPrice(order.total)}</strong>
        </div>
        {order.note && <p className="muted small">หมายเหตุ: {order.note}</p>}
        <p className="muted small">สั่งเมื่อ {formatTime(order.createdAt)}</p>
      </aside>

      {showReady && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="ready-title">
          <div className="modal ready-modal">
            <div className="ready-icon">🍽️</div>
            <h2 id="ready-title">อาหารพร้อมแล้ว!</h2>
            <p>
              คิวที่ <strong className="ready-queue">{order.queueNumber}</strong>
            </p>
            <p className="muted">มารับอาหารที่เคาน์เตอร์ได้เลย</p>
            <button type="button" className="btn btn-primary btn-block" onClick={() => setReadyDismissed(true)}>
              รับทราบ
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
