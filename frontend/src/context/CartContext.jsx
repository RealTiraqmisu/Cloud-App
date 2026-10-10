import { createContext, useContext, useMemo } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  // Cart keeps name/price only for display; the backend re-reads prices from Menu.
  const [lines, setLines] = useLocalStorage('cart', [])
  const [myOrders, setMyOrders] = useLocalStorage('myOrders', [])

  const value = useMemo(() => {
    const setQty = (menuItem, qty) =>
      setLines((prev) => {
        const rest = prev.filter((l) => l.menuId !== menuItem.menuId)
        if (qty <= 0) return rest
        const line = { menuId: menuItem.menuId, name: menuItem.name, price: menuItem.price, qty }
        const idx = prev.findIndex((l) => l.menuId === menuItem.menuId)
        if (idx < 0) return [...prev, line]
        const next = [...prev]
        next[idx] = line
        return next
      })

    return {
      lines,
      count: lines.reduce((n, l) => n + l.qty, 0),
      total: lines.reduce((sum, l) => sum + l.price * l.qty, 0),
      qtyOf: (menuId) => lines.find((l) => l.menuId === menuId)?.qty ?? 0,
      setQty,
      add: (menuItem) => setQty(menuItem, (lines.find((l) => l.menuId === menuItem.menuId)?.qty ?? 0) + 1),
      clear: () => setLines([]),
      myOrders,
      rememberOrder: (order) =>
        setMyOrders((prev) =>
          [{ orderId: order.orderId, createdAt: order.createdAt, total: order.total }, ...prev].slice(0, 20),
        ),
    }
  }, [lines, myOrders, setLines, setMyOrders])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}
