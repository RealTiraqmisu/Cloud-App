import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import StatusBadge from '../components/StatusBadge'
import { useCart } from '../context/CartContext'
import { formatPrice, formatTime } from '../utils/format'

export default function MyOrdersPage() {
  const { myOrders } = useCart()
  const [statuses, setStatuses] = useState({})

  useEffect(() => {
    let alive = true
    myOrders.forEach(({ orderId }) => {
      api
        .getOrder(orderId)
        .then((o) => alive && setStatuses((s) => ({ ...s, [orderId]: o.status })))
        .catch(() => alive && setStatuses((s) => ({ ...s, [orderId]: null })))
    })
    return () => {
      alive = false
    }
  }, [myOrders])

  return (
    <div className="narrow">
      <div className="page-head">
        <h1>ออเดอร์ของฉัน</h1>
        <p className="muted">ออเดอร์ที่สั่งจากเบราว์เซอร์นี้</p>
      </div>
      {myOrders.length === 0 ? (
        <div className="card empty">
          ยังไม่มีออเดอร์ · <Link to="/">ไปสั่งอาหาร</Link>
        </div>
      ) : (
        <ul className="order-list">
          {myOrders.map((o) => (
            <li key={o.orderId}>
              <Link to={`/order/${o.orderId}`} className="card order-row">
                <div>
                  <div className="mono small">{o.orderId}</div>
                  <div className="muted small">{formatTime(o.createdAt)} · {formatPrice(o.total)}</div>
                </div>
                {statuses[o.orderId] ? (
                  <StatusBadge status={statuses[o.orderId]} />
                ) : (
                  <span className="muted small">{statuses[o.orderId] === null ? 'ไม่พบ' : '…'}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
