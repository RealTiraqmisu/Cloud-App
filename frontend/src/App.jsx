import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { CartProvider } from './context/CartContext'
import AdminPage from './pages/AdminPage'
import KitchenPage from './pages/KitchenPage'
import MenuPage from './pages/MenuPage'
import MyOrdersPage from './pages/MyOrdersPage'
import OrderTrackingPage from './pages/OrderTrackingPage'

// HashRouter (/#/kitchen) so deep links work on an S3 static website without rewrites.
export default function App() {
  return (
    <HashRouter>
      <CartProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<MenuPage />} />
            <Route path="order/:orderId" element={<OrderTrackingPage />} />
            <Route path="my-orders" element={<MyOrdersPage />} />
            <Route path="kitchen" element={<KitchenPage />} />
            <Route path="admin" element={<AdminPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </CartProvider>
    </HashRouter>
  )
}
