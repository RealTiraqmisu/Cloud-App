import { ChevronRight, ReceiptText } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import QueuePlate from '../components/QueuePlate'
import StatusBadge from '../components/StatusBadge'
import { FINAL_STATUSES } from '../constants'
import { useCart } from '../context/CartContext'
import { formatPrice, formatTime, itemsSummary } from '../utils/format'

export default function MyOrdersPage() {
  const { myOrders } = useCart()
  // orderId → full order, or null when it can no longer be found.
  const [details, setDetails] = useState({})

  useEffect(() => {
    let alive = true
    myOrders.forEach(({ orderId }) => {
      api
        .getOrder(orderId)
        .then((o) => alive && setDetails((d) => ({ ...d, [orderId]: o })))
        .catch(() => alive && setDetails((d) => ({ ...d, [orderId]: null })))
    })
    return () => {
      alive = false
    }
  }, [myOrders])

  const rows = myOrders.map((o) => ({ ...o, order: details[o.orderId] }))
  const active = rows.filter((r) => !r.order || !FINAL_STATUSES.includes(r.order.status))
  const finished = rows.filter((r) => r.order && FINAL_STATUSES.includes(r.order.status))

  return (
    <div className="page page-narrow">
      <div className="page-head">
        <h1>ออเดอร์ของฉัน</h1>
        <p>ออเดอร์ที่สั่งจากเครื่องนี้ กดเพื่อดูสถานะ</p>
      </div>

      {myOrders.length === 0 ? (
        <div className="empty-state">
          <ReceiptText size={40} aria-hidden="true" />
          <strong>ยังไม่มีออเดอร์จากเครื่องนี้</strong>
          <span>สั่งอาหารแล้ว ออเดอร์จะมาอยู่ที่นี่</span>
          <Link to="/" className="btn btn-primary">ไปที่เมนู</Link>
        </div>
      ) : (
        <>
          {active.length > 0 && <OrderGroup title="กำลังดำเนินการ" rows={active} />}
          {finished.length > 0 && <OrderGroup title="ที่ผ่านมา" rows={finished} finished />}
        </>
      )}
    </div>
  )
}

function OrderGroup({ title, rows, finished = false }) {
  return (
    <section className="order-group" aria-label={title}>
      <h2>{title}</h2>
      <ul className={`order-list${finished ? ' is-finished' : ''}`}>
        {rows.map(({ orderId, createdAt, total, order }) => (
          <li key={orderId}>
            <Link to={`/order/${orderId}`} className="order-row">
              <QueuePlate number={order?.queueNumber ?? null} size="md" />
              <div className="order-row-main">
                <div className="order-row-items">
                  {order === undefined ? 'กำลังโหลด…' : order === null ? 'ไม่พบออเดอร์นี้แล้ว' : itemsSummary(order.items)}
                </div>
                <div className="order-row-meta">
                  {formatTime(createdAt)} · {formatPrice(total)}
                  {order?.tableNumber ? ` · โต๊ะ ${order.tableNumber}` : ''}
                </div>
              </div>
              <div className="order-row-side">
                {order && <StatusBadge status={order.status} />}
                <ChevronRight size={20} className="order-row-chevron" aria-hidden="true" />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
