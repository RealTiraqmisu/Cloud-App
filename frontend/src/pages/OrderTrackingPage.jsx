import { Ban, Bell, BellRing, Check, CircleAlert, RefreshCw, UtensilsCrossed } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api'
import ConfirmDialog from '../components/ConfirmDialog'
import QueuePlate from '../components/QueuePlate'
import StatusBadge from '../components/StatusBadge'
import { CANCELLABLE_STATUSES, FINAL_STATUSES, ROUTE_STOPS } from '../constants'
import { usePolling } from '../hooks/usePolling'
import { formatPrice, formatTime } from '../utils/format'
import {
  canUseBrowserNotification,
  playChime,
  requestBrowserNotification,
  showBrowserNotification,
} from '../utils/notify'

const HEADLINE = {
  PENDING: 'ส่งออเดอร์แล้ว กำลังเข้าคิว',
  QUEUED: 'ออเดอร์เข้าคิวแล้ว',
  PREPARING: 'ครัวกำลังทำอาหารของคุณ',
  READY: 'อาหารพร้อมแล้ว',
  COMPLETED: 'เสิร์ฟเรียบร้อย ขอให้อร่อย',
  CANCELLED: 'ออเดอร์นี้ถูกยกเลิก',
}

const HINT = {
  PENDING: 'อีกสักครู่จะได้เลขคิว',
  QUEUED: 'รอครัวเริ่มทำ ยกเลิกได้จนกว่าครัวจะเริ่ม',
  PREPARING: 'อีกไม่นาน พนักงานจะนำอาหารไปที่โต๊ะ',
  READY: 'พนักงานกำลังนำอาหารไปเสิร์ฟที่โต๊ะของคุณ',
  COMPLETED: 'อยากสั่งเพิ่ม กลับไปที่เมนูได้เลย',
  CANCELLED: 'ถ้ายกเลิกโดยไม่ได้ตั้งใจ สั่งใหม่ได้จากหน้าเมนู',
}

export default function OrderTrackingPage() {
  const { orderId } = useParams()
  const { data: order, error, loading, setData } = usePolling(() => api.getOrder(orderId), {
    key: orderId,
    stopWhen: (o) => FINAL_STATUSES.includes(o.status),
  })
  const [readyDismissed, setReadyDismissed] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [actionError, setActionError] = useState(null)
  const [notifPermission, setNotifPermission] = useState(() =>
    canUseBrowserNotification() ? Notification.permission : 'unsupported',
  )
  const prevStatus = useRef(null)
  const closeConfirm = useCallback(() => setConfirmCancel(false), [])

  const status = order?.status
  const table = order?.tableNumber

  useEffect(() => {
    if (!status) return
    // Only chime on a live transition, not when opening an already-ready order.
    if (status === 'READY' && prevStatus.current && prevStatus.current !== 'READY') {
      playChime()
      showBrowserNotification('อาหารพร้อมแล้ว', `คิว ${order.queueNumber ?? '-'} — พนักงานกำลังนำไปเสิร์ฟ${table ? ` โต๊ะ ${table}` : ''}`)
    }
    prevStatus.current = status
  }, [status, order?.queueNumber, table])

  useEffect(() => {
    const original = document.title
    if (status === 'READY') document.title = `อาหารพร้อมแล้ว · คิว ${order?.queueNumber ?? ''} — ครัวคลาวด์`
    return () => {
      document.title = original
    }
  }, [status, order?.queueNumber])

  async function cancel() {
    setCancelling(true)
    setActionError(null)
    try {
      setData(await api.updateOrderStatus(orderId, 'CANCELLED'))
      setConfirmCancel(false)
    } catch (err) {
      setActionError(`ยกเลิกไม่สำเร็จ: ${err.message} ถ้าครัวเริ่มทำแล้วจะยกเลิกไม่ได้ ให้แจ้งพนักงาน`)
      setConfirmCancel(false)
    } finally {
      setCancelling(false)
    }
  }

  async function enableNotifications() {
    setNotifPermission(await requestBrowserNotification())
  }

  if (loading && !order) {
    return (
      <div className="page">
        <div className="panel skeleton" style={{ height: 360 }} aria-busy="true" aria-label="กำลังโหลดออเดอร์" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="page page-narrow">
        <div className="empty-state">
          <CircleAlert size={40} aria-hidden="true" />
          <strong>{error?.status === 404 ? 'ไม่พบออเดอร์นี้' : 'โหลดออเดอร์ไม่สำเร็จ'}</strong>
          <span>
            {error?.status === 404
              ? 'ลิงก์อาจไม่ครบ ลองเปิดจากหน้า “ออเดอร์ของฉัน”'
              : `${error?.message ?? ''} ตรวจอินเทอร์เน็ตแล้วรีเฟรชหน้านี้`}
          </span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/my-orders" className="btn">ออเดอร์ของฉัน</Link>
            <Link to="/" className="btn btn-primary">กลับไปที่เมนู</Link>
          </div>
        </div>
      </div>
    )
  }

  const historyAt = Object.fromEntries(order.statusHistory.map((h) => [h.status, h.at]))
  const reachedIndex = ROUTE_STOPS.findIndex((s) => s.status === status)
  const final = FINAL_STATUSES.includes(status)

  return (
    <div className="page">
      <div className="tracking-layout">
        <section className="panel" aria-labelledby="tracking-title">
          <div className="tracking-hero">
            <QueuePlate number={order.queueNumber} size="lg" />
            <div>
              <StatusBadge status={status} />
              <h1 id="tracking-title" className="tracking-title">{HEADLINE[status]}</h1>
              <p className="tracking-hint">{HINT[status]}</p>
              <div className="tracking-meta">
                {table && (
                  <span>
                    โต๊ะ <strong className="num">{table}</strong>
                  </span>
                )}
                <span>
                  คุณ<strong>{order.customerName}</strong>
                </span>
                <span>
                  สั่งเมื่อ <strong className="num">{formatTime(order.createdAt)}</strong>
                </span>
              </div>
            </div>
          </div>

          {status === 'CANCELLED' ? (
            <div className="status-banner is-cancelled">
              <Ban size={22} aria-hidden="true" />
              ยกเลิกเมื่อ {formatTime(historyAt.CANCELLED)}
            </div>
          ) : (
            <ol className="route" aria-label="สถานะออเดอร์">
              {ROUTE_STOPS.map((stop, i) => {
                const done = i < reachedIndex || status === 'COMPLETED'
                const current = i === reachedIndex && status !== 'COMPLETED'
                const state = done ? 'is-done' : current ? 'is-current' : ''
                return (
                  <li key={stop.status} className={`route-stop ${state}`} aria-current={current ? 'step' : undefined}>
                    <span className="route-dot" aria-hidden="true">
                      {done ? <Check size={16} strokeWidth={3} /> : i + 1}
                    </span>
                    <span className="route-label">
                      {stop.label}
                      {(current || (i === 0 && status === 'PENDING')) && (
                        <span className="route-sub">{i === 0 && status === 'PENDING' ? 'กำลังส่งเข้าคิว…' : stop.sub}</span>
                      )}
                    </span>
                    <span className="route-time">{historyAt[stop.status] ? formatTime(historyAt[stop.status]) : ''}</span>
                  </li>
                )
              })}
            </ol>
          )}

          {error && (
            <div className="alert alert-warn" role="status" style={{ marginTop: 24, marginBottom: 0 }}>
              <RefreshCw size={18} aria-hidden="true" />
              <span>เชื่อมต่อไม่ได้ชั่วคราว กำลังลองใหม่อัตโนมัติ</span>
            </div>
          )}
          {actionError && (
            <div className="alert alert-error" role="alert" style={{ marginTop: 24, marginBottom: 0 }}>
              <CircleAlert size={18} aria-hidden="true" />
              <span>{actionError}</span>
            </div>
          )}

          <div className="tracking-actions">
            {final ? (
              <Link to="/" className="btn btn-primary">
                <UtensilsCrossed size={18} aria-hidden="true" />
                สั่งอาหารเพิ่ม
              </Link>
            ) : (
              notifPermission === 'default' && (
                <button type="button" className="btn btn-tint" onClick={enableNotifications}>
                  <Bell size={18} aria-hidden="true" />
                  แจ้งเตือนเมื่ออาหารพร้อม
                </button>
              )
            )}
            {CANCELLABLE_STATUSES.includes(status) && (
              <button type="button" className="btn btn-danger-quiet" onClick={() => setConfirmCancel(true)}>
                ยกเลิกออเดอร์
              </button>
            )}
            {!final && (
              <span className="live-note">
                <RefreshCw size={14} aria-hidden="true" />
                อัปเดตเองทุกไม่กี่วินาที
              </span>
            )}
          </div>
        </section>

        <aside className="panel" aria-labelledby="receipt-title">
          <h2 id="receipt-title">รายการที่สั่ง</h2>
          <ul className="receipt">
            {order.items.map((i) => (
              <li key={i.menuId}>
                <span className="qty">{i.qty}×</span>
                <span>{i.name}</span>
                <span className="amount">{formatPrice(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="cart-total">
            <span>รวม</span>
            <strong>{formatPrice(order.total)}</strong>
          </div>
          <div className="receipt-foot">
            {order.note && <span>หมายเหตุ: {order.note}</span>}
            <span className="num">เลขออเดอร์ {order.orderId}</span>
          </div>
        </aside>
      </div>

      {status === 'READY' && !readyDismissed && (
        <div className="dialog-backdrop">
          <div className="dialog ready-dialog" role="dialog" aria-modal="true" aria-labelledby="ready-title">
            <BellRing size={28} aria-hidden="true" />
            <h2 id="ready-title">อาหารพร้อมแล้ว</h2>
            <QueuePlate number={order.queueNumber} size="lg" label="คิว" />
            <p>พนักงานกำลังนำอาหารไปเสิร์ฟ{table ? ` ที่โต๊ะ ${table}` : 'ที่โต๊ะของคุณ'}</p>
            <button type="button" className="btn btn-primary btn-block btn-lg" onClick={() => setReadyDismissed(true)} autoFocus>
              รับทราบ
            </button>
          </div>
        </div>
      )}

      {confirmCancel && (
        <ConfirmDialog
          title={`ยกเลิกออเดอร์${order.queueNumber ? ` คิว ${order.queueNumber}` : ''}?`}
          body="ครัวจะไม่ทำรายการนี้ ถ้าเปลี่ยนใจต้องสั่งใหม่"
          confirmLabel="ยกเลิกออเดอร์"
          cancelLabel="ไม่ยกเลิก"
          danger
          busy={cancelling}
          onConfirm={cancel}
          onCancel={closeConfirm}
        />
      )}
    </div>
  )
}
