import { ChefHat, CookingPot, NotebookPen, ReceiptText, UtensilsCrossed } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { USE_MOCK } from '../config'
import { useCart } from '../context/CartContext'

export default function Layout() {
  const { myOrders } = useCart()
  const { pathname } = useLocation()
  const isBoard = pathname.startsWith('/kitchen')
  const isStaff = isBoard || pathname.startsWith('/admin')
  const navClass = ({ isActive }) => `nav-link${isActive ? ' active' : ''}`

  return (
    <>
      <header className={`appbar on-board${isStaff ? '' : ' is-customer'}`}>
        <div className="appbar-inner">
          <div className="brand-row">
            <NavLink to="/" className="brand">
              <span className="brand-mark" aria-hidden="true">
                <CookingPot size={20} strokeWidth={2.25} />
              </span>
              ครัวคลาวด์
            </NavLink>
            {USE_MOCK && (
              <span className="demo-tag" title="ยังไม่ได้เชื่อม API — ออเดอร์และเมนูเก็บอยู่ในเบราว์เซอร์นี้เท่านั้น">
                โหมดทดลอง
              </span>
            )}
            <NavLink
              to="/my-orders"
              className={({ isActive }) => `orders-shortcut${isActive ? ' active' : ''}`}
              aria-label={`ออเดอร์ของฉัน${myOrders.length ? ` ${myOrders.length} รายการ` : ''}`}
            >
              <ReceiptText size={20} aria-hidden="true" />
              ออเดอร์
              {myOrders.length > 0 && <span className="nav-count num">{myOrders.length}</span>}
            </NavLink>
          </div>
          <nav className="nav" aria-label="เมนูหลัก">
            <NavLink to="/" end className={navClass}>
              <UtensilsCrossed size={18} aria-hidden="true" />
              เมนู
            </NavLink>
            <NavLink to="/my-orders" className={navClass}>
              <ReceiptText size={18} aria-hidden="true" />
              ออเดอร์ของฉัน
              {myOrders.length > 0 && <span className="nav-count">{myOrders.length}</span>}
            </NavLink>
            {isStaff && (
              <>
                <span className="nav-divider" aria-hidden="true" />
                <NavLink to="/kitchen" className={navClass}>
                  <ChefHat size={18} aria-hidden="true" />
                  ครัว
                </NavLink>
                <NavLink to="/admin" className={navClass}>
                  <NotebookPen size={18} aria-hidden="true" />
                  จัดการเมนู
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className={isBoard ? 'board-page on-board' : undefined}>
        <Outlet />
      </main>

      {!isStaff && (
        <footer className="app-foot">
          <span>สำหรับพนักงาน:</span>
          <NavLink to="/kitchen">หน้าจอครัว</NavLink>
          <NavLink to="/admin">จัดการเมนู</NavLink>
        </footer>
      )}
    </>
  )
}
