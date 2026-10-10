import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import MenuImage from '../components/MenuImage'
import QtyStepper from '../components/QtyStepper'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../utils/format'

const ALL = 'ทั้งหมด'

export default function MenuPage() {
  const [menu, setMenu] = useState(null)
  const [error, setError] = useState(null)
  const [category, setCategory] = useState(ALL)
  const cartRef = useRef(null)
  const cart = useCart()

  useEffect(() => {
    api.listMenu().then(setMenu).catch(setError)
  }, [])

  const categories = useMemo(
    () => [ALL, ...new Set((menu ?? []).map((m) => m.category).filter(Boolean))],
    [menu],
  )
  const visible = (menu ?? []).filter((m) => category === ALL || m.category === category)

  return (
    <div className="menu-layout">
      <section>
        <div className="page-head">
          <h1>เมนูวันนี้</h1>
          <p className="muted">เลือกเมนู แล้วกดสั่งในตะกร้า — ติดตามสถานะได้ทันที</p>
        </div>

        <div className="chips" role="tablist" aria-label="หมวดหมู่">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={c === category}
              className={`chip${c === category ? ' active' : ''}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {error && <div className="alert error">โหลดเมนูไม่สำเร็จ: {error.message}</div>}
        {!menu && !error && <div className="menu-grid">{Array.from({ length: 6 }, (_, i) => <div key={i} className="card skeleton" />)}</div>}
        {menu && visible.length === 0 && <div className="empty">ยังไม่มีเมนูในหมวดนี้</div>}

        <div className="menu-grid">
          {visible.map((item) => {
            const qty = cart.qtyOf(item.menuId)
            return (
              <article key={item.menuId} className={`card menu-card${item.available ? '' : ' sold-out'}`}>
                <MenuImage item={item} />
                {!item.available && <span className="sold-out-tag">หมด</span>}
                <div className="menu-card-body">
                  <h3>{item.name}</h3>
                  {item.description && <p className="muted small">{item.description}</p>}
                  <div className="menu-card-foot">
                    <strong className="price">{formatPrice(item.price)}</strong>
                    {qty > 0 ? (
                      <QtyStepper qty={qty} onChange={(q) => cart.setQty(item, q)} />
                    ) : (
                      <button type="button" className="btn btn-primary btn-sm" disabled={!item.available} onClick={() => cart.add(item)}>
                        + เพิ่ม
                      </button>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <aside ref={cartRef} className="cart-panel">
        <CartPanel menu={menu} />
      </aside>

      {cart.count > 0 && (
        <button
          type="button"
          className="cart-fab"
          onClick={() => cartRef.current?.scrollIntoView({ behavior: 'smooth' })}
        >
          🛒 ตะกร้า {cart.count} รายการ · {formatPrice(cart.total)}
        </button>
      )}
    </div>
  )
}

function CartPanel({ menu }) {
  const cart = useCart()
  const navigate = useNavigate()
  const [form, setForm] = useState({ customerName: '', contact: '', note: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  // Items that went sold out after being added to the cart.
  const unavailable = cart.lines.filter((l) => menu?.find((m) => m.menuId === l.menuId)?.available === false)

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const order = await api.createOrder({
        ...form,
        items: cart.lines.map(({ menuId, qty }) => ({ menuId, qty })),
      })
      cart.rememberOrder(order)
      cart.clear()
      navigate(`/order/${order.orderId}`)
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <div className="card cart">
      <h2>ตะกร้าของคุณ</h2>
      {cart.lines.length === 0 ? (
        <p className="empty small">ยังไม่มีรายการ — กด “+ เพิ่ม” ที่เมนู</p>
      ) : (
        <form onSubmit={submit}>
          <ul className="cart-lines">
            {cart.lines.map((l) => (
              <li key={l.menuId}>
                <div>
                  <div>{l.name}</div>
                  <div className="muted small">{formatPrice(l.price)} × {l.qty}</div>
                </div>
                <QtyStepper qty={l.qty} onChange={(q) => cart.setQty(l, q)} disabled={submitting} />
              </li>
            ))}
          </ul>
          <div className="cart-total">
            <span>รวม</span>
            <strong>{formatPrice(cart.total)}</strong>
          </div>

          <label className="field">
            <span>ชื่อผู้สั่ง *</span>
            <input required maxLength={60} value={form.customerName} onChange={update('customerName')} placeholder="เช่น สมชาย" />
          </label>
          <label className="field">
            <span>อีเมล / เบอร์ (ไม่บังคับ)</span>
            <input maxLength={100} value={form.contact} onChange={update('contact')} placeholder="ใช้แจ้งเตือนเมื่ออาหารพร้อม" />
          </label>
          <label className="field">
            <span>หมายเหตุ</span>
            <textarea rows={2} maxLength={200} value={form.note} onChange={update('note')} placeholder="เช่น ไม่เผ็ด ไม่ใส่ผัก" />
          </label>

          {unavailable.length > 0 && (
            <div className="alert warn small">เมนูหมดแล้ว: {unavailable.map((l) => l.name).join(', ')} — กรุณาลบออกก่อนสั่ง</div>
          )}
          {error && <div className="alert error small">{error}</div>}

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting || unavailable.length > 0}>
            {submitting ? 'กำลังส่งออเดอร์…' : `สั่งอาหาร · ${formatPrice(cart.total)}`}
          </button>
        </form>
      )}
    </div>
  )
}
