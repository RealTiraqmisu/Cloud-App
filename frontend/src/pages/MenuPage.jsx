import { Ban, ChevronUp, CircleAlert, LoaderCircle, Plus, ShoppingBag, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import MenuImage from '../components/MenuImage'
import QtyStepper from '../components/QtyStepper'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../utils/format'
import { unlockAudio } from '../utils/notify'

const ALL = 'ทั้งหมด'
const OTHER = 'อื่น ๆ'

export default function MenuPage() {
  const [menu, setMenu] = useState(null)
  const [error, setError] = useState(null)
  const [category, setCategory] = useState(ALL)
  const [sheetOpen, setSheetOpen] = useState(false)
  const closeSheet = useCallback(() => setSheetOpen(false), [])
  const cart = useCart()

  useEffect(() => {
    api.listMenu().then(setMenu).catch(setError)
  }, [])

  // Sections in the order categories first appear on the menu, like a wall board.
  const sections = useMemo(() => {
    const map = new Map()
    for (const item of menu ?? []) {
      const key = item.category || OTHER
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(item)
    }
    return [...map.entries()].map(([name, items]) => ({ name, items }))
  }, [menu])

  const visible = category === ALL ? sections : sections.filter((s) => s.name === category)

  return (
    <div className={`page${cart.count > 0 ? ' has-cart-bar' : ''}`}>
      <div className="menu-layout">
        <section aria-labelledby="menu-title">
          <div className="page-head">
            <h1 id="menu-title">เมนูวันนี้</h1>
            <p>สั่งจากโต๊ะได้เลย พนักงานจะนำอาหารไปเสิร์ฟให้</p>
          </div>

          {sections.length > 1 && (
            <div className="category-bar">
              <div className="category-tabs" role="group" aria-label="เลือกหมวดหมู่">
                {[{ name: ALL, items: menu ?? [] }, ...sections].map((s) => (
                  <button
                    key={s.name}
                    type="button"
                    className="category-tab"
                    aria-pressed={s.name === category}
                    onClick={() => setCategory(s.name)}
                  >
                    {s.name}
                    <span className="tab-count">{s.items.length}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="alert alert-error" role="alert">
              <CircleAlert size={18} aria-hidden="true" />
              <span>
                โหลดเมนูไม่สำเร็จ ({error.message}) ลองรีเฟรชหน้านี้อีกครั้ง ถ้ายังไม่ได้ให้แจ้งพนักงาน
              </span>
            </div>
          )}

          {!menu && !error && (
            <div className="dish-list" aria-busy="true" aria-label="กำลังโหลดเมนู">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="dish">
                  <div className="dish-thumb skeleton" />
                  <div className="dish-body">
                    <div className="skeleton" style={{ height: 20, width: '70%' }} />
                    <div className="skeleton" style={{ height: 14, width: '45%', marginTop: 10 }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {menu && menu.length === 0 && (
            <div className="empty-state">
              <Ban size={40} aria-hidden="true" />
              <strong>ยังไม่มีเมนูในร้าน</strong>
              <span>ร้านกำลังเตรียมเมนู ลองกลับมาใหม่อีกครั้ง</span>
            </div>
          )}

          {visible.map((section) => (
            <section key={section.name} className="menu-section" aria-labelledby={`cat-${section.name}`}>
              <div className="menu-section-head">
                <h2 id={`cat-${section.name}`}>{section.name}</h2>
                <span className="muted small">{section.items.length} รายการ</span>
              </div>
              <ul className={`dish-list${section.items.length === 1 ? ' is-single' : ''}`}>
                {section.items.map((item) => (
                  <Dish key={item.menuId} item={item} />
                ))}
              </ul>
            </section>
          ))}
        </section>

        <CartPanel menu={menu} open={sheetOpen} onClose={closeSheet} />
      </div>

      <button
        type="button"
        className={`sheet-backdrop${sheetOpen ? ' is-open' : ''}`}
        aria-hidden="true"
        tabIndex={-1}
        onClick={closeSheet}
      />

      {cart.count > 0 && !sheetOpen && (
        <div className="cart-bar on-board">
          <button type="button" className="cart-bar-button" onClick={() => setSheetOpen(true)} aria-haspopup="dialog">
            <ShoppingBag size={22} aria-hidden="true" />
            <span>
              <span className="cart-bar-count">{cart.count} รายการ</span>
              <br />
              <span className="cart-bar-total num">{formatPrice(cart.total)}</span>
            </span>
            <span className="cart-bar-cta">
              ดูตะกร้า
              <ChevronUp size={18} aria-hidden="true" />
            </span>
          </button>
        </div>
      )}
    </div>
  )
}

function Dish({ item }) {
  const cart = useCart()
  const qty = cart.qtyOf(item.menuId)
  return (
    <li className={`dish${item.available ? '' : ' is-sold-out'}${item.imageUrl ? '' : ' no-thumb'}`}>
      {item.imageUrl && <MenuImage item={item} />}
      <div className="dish-body">
        <h3 className="dish-name">{item.name}</h3>
        {item.description && <p className="dish-desc">{item.description}</p>}
        <div className="dish-foot">
          <span className="price">{formatPrice(item.price)}</span>
          {!item.available ? (
            <span className="sold-out-label">
              <Ban size={18} aria-hidden="true" />
              หมดแล้ว
            </span>
          ) : qty > 0 ? (
            <QtyStepper qty={qty} name={item.name} onChange={(q) => cart.setQty(item, q)} />
          ) : (
            <button type="button" className="btn btn-tint" onClick={() => cart.add(item)} aria-label={`เพิ่ม ${item.name} ลงตะกร้า`}>
              <Plus size={18} aria-hidden="true" />
              เพิ่ม
            </button>
          )}
        </div>
      </div>
    </li>
  )
}

function CartPanel({ menu, open, onClose }) {
  const cart = useCart()
  const navigate = useNavigate()
  const headingRef = useRef(null)
  const [form, setForm] = useState(() => ({ ...cart.diner, contact: '', note: '' }))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  // Items that went sold out after being added to the cart.
  const unavailable = cart.lines.filter((l) => menu?.find((m) => m.menuId === l.menuId)?.available === false)
  const empty = cart.lines.length === 0

  // Phone bottom sheet: focus the heading, lock page scroll, close on Escape.
  useEffect(() => {
    if (!open) return undefined
    headingRef.current?.focus()
    const root = document.documentElement
    const previous = root.style.overflow
    root.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => {
      root.style.overflow = previous
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  useEffect(() => {
    if (open && empty && !submitting) onClose()
  }, [open, empty, submitting, onClose])

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    unlockAudio()
    setSubmitting(true)
    setError(null)
    const tableNumber = form.tableNumber.trim()
    const customerName = form.customerName.trim()
    cart.setDiner({ customerName, tableNumber })
    try {
      const order = await api.createOrder({
        customerName,
        tableNumber,
        contact: form.contact,
        note: form.note,
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
    <aside
      className={`cart-panel${open ? ' is-open' : ''}`}
      aria-labelledby="cart-title"
      role={open ? 'dialog' : undefined}
      aria-modal={open ? 'true' : undefined}
    >
      <div className="cart-inner">
        <div className="cart-head">
          <h2 id="cart-title" ref={headingRef} tabIndex={-1}>
            ตะกร้า{!empty && <span className="muted small"> · {cart.count} รายการ</span>}
          </h2>
          <button type="button" className="btn btn-quiet btn-icon cart-close" onClick={onClose} aria-label="ปิดตะกร้า">
            <X size={22} aria-hidden="true" />
          </button>
        </div>

        {empty ? (
          <div className="empty-state" style={{ padding: '24px 0' }}>
            <ShoppingBag size={36} aria-hidden="true" />
            <strong>ยังไม่มีอะไรในตะกร้า</strong>
            <span className="small">กด “เพิ่ม” ที่เมนูที่อยากสั่ง</span>
          </div>
        ) : (
          <form onSubmit={submit}>
            <ul className="cart-lines">
              {cart.lines.map((l) => (
                <li key={l.menuId} className="cart-line">
                  <div>
                    <div className="cart-line-name">{l.name}</div>
                    <div className="muted small num">
                      {formatPrice(l.price)} × {l.qty} = {formatPrice(l.price * l.qty)}
                    </div>
                  </div>
                  <QtyStepper qty={l.qty} name={l.name} onChange={(q) => cart.setQty(l, q)} disabled={submitting} />
                </li>
              ))}
            </ul>
            <div className="cart-total">
              <span>รวมทั้งหมด</span>
              <strong>{formatPrice(cart.total)}</strong>
            </div>

            <div className="field-row">
              <label className="field">
                <span className="field-label">เลขโต๊ะ</span>
                <input
                  className="input num"
                  required
                  maxLength={10}
                  inputMode="numeric"
                  autoComplete="off"
                  value={form.tableNumber}
                  onChange={update('tableNumber')}
                  placeholder="เช่น 5"
                />
              </label>
              <label className="field">
                <span className="field-label">ชื่อผู้สั่ง</span>
                <input
                  className="input"
                  required
                  maxLength={60}
                  autoComplete="name"
                  value={form.customerName}
                  onChange={update('customerName')}
                  placeholder="เช่น สมชาย"
                />
              </label>
            </div>
            <label className="field">
              <span className="field-label">
                หมายเหตุถึงครัว <span className="optional">ไม่บังคับ</span>
              </span>
              <textarea className="input" rows={2} maxLength={200} value={form.note} onChange={update('note')} placeholder="เช่น ไม่เผ็ด ไม่ใส่ผักชี" />
            </label>
            <label className="field">
              <span className="field-label">
                เบอร์โทร <span className="optional">ไม่บังคับ</span>
              </span>
              <input
                className="input"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                maxLength={100}
                value={form.contact}
                onChange={update('contact')}
              />
              <span className="field-hint">เผื่อร้านต้องติดต่อกลับเรื่องออเดอร์นี้</span>
            </label>

            {unavailable.length > 0 && (
              <div className="alert alert-warn" role="alert">
                <CircleAlert size={18} aria-hidden="true" />
                <div>
                  <div>หมดแล้ว: {unavailable.map((l) => l.name).join(', ')}</div>
                  <button type="button" className="btn btn-quiet" style={{ paddingInline: 0 }} onClick={() => unavailable.forEach((l) => cart.setQty(l, 0))}>
                    เอาเมนูที่หมดออกจากตะกร้า
                  </button>
                </div>
              </div>
            )}
            {error && (
              <div className="alert alert-error" role="alert">
                <CircleAlert size={18} aria-hidden="true" />
                <span>สั่งไม่สำเร็จ: {error} ลองกดสั่งอีกครั้ง</span>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting || unavailable.length > 0}>
              {submitting ? (
                <>
                  <LoaderCircle size={20} className="spin" aria-hidden="true" />
                  กำลังส่งออเดอร์…
                </>
              ) : (
                <>
                  ยืนยันการสั่ง · <span className="num">{formatPrice(cart.total)}</span>
                </>
              )}
            </button>
            <p className="cart-note">หลังกดสั่ง จะเห็นเลขคิวและสถานะอาหารทันที</p>
          </form>
        )}
      </div>
    </aside>
  )
}
