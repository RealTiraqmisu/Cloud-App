import { NavLink, Outlet } from 'react-router-dom'
import { USE_MOCK } from '../config'
import { useCart } from '../context/CartContext'

export default function Layout() {
  const { count, myOrders } = useCart()
  const navClass = ({ isActive }) => `nav-link${isActive ? ' active' : ''}`

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <NavLink to="/" className="brand">
            <span className="brand-mark">🍳</span>
            <span>ครัวจิ๋ว</span>
          </NavLink>
          <nav className="nav">
            <NavLink to="/" end className={navClass}>
              สั่งอาหาร{count > 0 && <span className="nav-count">{count}</span>}
            </NavLink>
            <NavLink to="/my-orders" className={navClass}>
              ออเดอร์ของฉัน{myOrders.length > 0 && <span className="nav-count muted">{myOrders.length}</span>}
            </NavLink>
            <NavLink to="/kitchen" className={navClass}>
              ครัว
            </NavLink>
            <NavLink to="/admin" className={navClass}>
              จัดการเมนู
            </NavLink>
          </nav>
        </div>
      </header>

      {USE_MOCK && (
        <div className="mock-banner">
          โหมดจำลอง — ยังไม่ได้เชื่อม API (ข้อมูลเก็บในเบราว์เซอร์) · ตั้งค่า <code>VITE_API_URL</code> ใน{' '}
          <code>.env</code> เพื่อใช้ AWS จริง
        </div>
      )}

      <main className="container">
        <Outlet />
      </main>
    </div>
  )
}
