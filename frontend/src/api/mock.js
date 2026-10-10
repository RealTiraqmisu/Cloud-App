// Mock backend stored in localStorage so the UI works before AWS is ready.
// Shared across tabs: open the kitchen and customer pages side by side.
// Mirrors the Lambda rules in docs/API.md (price lookup, status transitions).
import { NEXT_STATUS } from '../constants'
import { ApiError } from './errors'

const KEYS = {
  menu: 'mock.menu',
  orders: 'mock.orders',
  counter: 'mock.queueCounter',
  images: 'mock.images',
}

// Simulates the SQS → kitchenConsumer delay before PENDING becomes QUEUED.
const QUEUE_DELAY_MS = 2500

const SEED_MENU = [
  { menuId: 'm-kaprao', name: 'ข้าวกะเพราหมูสับไข่ดาว', description: 'เผ็ดกลาง ใส่ใบกะเพราเยอะ', price: 60, category: 'อาหารจานเดียว', imageKey: null, available: true },
  { menuId: 'm-khaoman', name: 'ข้าวมันไก่', description: 'น้ำจิ้มเต้าเจี้ยวสูตรร้าน', price: 55, category: 'อาหารจานเดียว', imageKey: null, available: true },
  { menuId: 'm-padthai', name: 'ผัดไทยกุ้งสด', description: 'เส้นจันท์ กุ้ง 4 ตัว', price: 80, category: 'เส้น', imageKey: null, available: true },
  { menuId: 'm-boat', name: 'ก๋วยเตี๋ยวเรือ', description: 'หมูน้ำตก เส้นเล็ก', price: 50, category: 'เส้น', imageKey: null, available: true },
  { menuId: 'm-moo-ping', name: 'หมูปิ้ง (3 ไม้)', description: 'พร้อมข้าวเหนียว', price: 45, category: 'ของทานเล่น', imageKey: null, available: false },
  { menuId: 'm-thai-tea', name: 'ชาไทยเย็น', description: 'หวานน้อยได้', price: 35, category: 'เครื่องดื่ม', imageKey: null, available: true },
  { menuId: 'm-mango', name: 'ข้าวเหนียวมะม่วง', description: 'มะม่วงน้ำดอกไม้', price: 70, category: 'ของหวาน', imageKey: null, available: true },
]

const delay = (ms = 200 + Math.random() * 250) => new Promise((r) => setTimeout(r, ms))
const nowIso = () => new Date().toISOString()
const randomId = (len = 6) => Math.random().toString(36).slice(2, 2 + len)

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    throw new ApiError(507, 'พื้นที่ localStorage เต็ม (ลองใช้รูปเล็กลง)')
  }
}

function loadMenu() {
  const menu = load(KEYS.menu, null)
  if (menu) return menu
  save(KEYS.menu, SEED_MENU)
  return structuredClone(SEED_MENU)
}

function withImageUrl(item) {
  const images = load(KEYS.images, {})
  return { ...item, imageUrl: item.imageKey ? images[item.imageKey] ?? null : null }
}

function validateMenuBody(body) {
  if (!body.name?.trim()) throw new ApiError(400, 'กรุณาใส่ชื่อเมนู')
  const price = Number(body.price)
  if (!Number.isFinite(price) || price < 0) throw new ApiError(400, 'ราคาไม่ถูกต้อง')
  return {
    name: body.name.trim(),
    description: body.description?.trim() ?? '',
    price,
    category: body.category?.trim() ?? '',
    imageKey: body.imageKey ?? null,
    available: body.available !== false,
  }
}

// Stand-in for the SQS consumer Lambda: promote PENDING orders after a delay.
function loadOrdersProcessed() {
  const orders = load(KEYS.orders, [])
  let changed = false
  for (const order of orders) {
    if (order.status === 'PENDING' && Date.now() - new Date(order.createdAt).getTime() > QUEUE_DELAY_MS) {
      const counter = load(KEYS.counter, 0) + 1
      save(KEYS.counter, counter)
      const at = nowIso()
      order.status = 'QUEUED'
      order.queueNumber = counter
      order.updatedAt = at
      order.statusHistory.push({ status: 'QUEUED', at })
      changed = true
    }
  }
  if (changed) save(KEYS.orders, orders)
  return orders
}

export async function listMenu() {
  await delay()
  return loadMenu().map(withImageUrl)
}

export async function createMenuItem(body) {
  await delay()
  const item = { menuId: `m-${randomId()}`, ...validateMenuBody(body) }
  save(KEYS.menu, [...loadMenu(), item])
  return withImageUrl(item)
}

export async function updateMenuItem(menuId, body) {
  await delay()
  const menu = loadMenu()
  const idx = menu.findIndex((m) => m.menuId === menuId)
  if (idx < 0) throw new ApiError(404, 'ไม่พบเมนูนี้')
  menu[idx] = { menuId, ...validateMenuBody(body) }
  save(KEYS.menu, menu)
  return withImageUrl(menu[idx])
}

export async function deleteMenuItem(menuId) {
  await delay()
  save(KEYS.menu, loadMenu().filter((m) => m.menuId !== menuId))
}

// Mock "S3": downscale the image and keep it as a data URL in localStorage.
export async function uploadMenuImage(file) {
  if (!file.type.startsWith('image/')) throw new ApiError(400, 'รองรับเฉพาะไฟล์รูปภาพ')
  const dataUrl = await resizeImage(file, 480)
  const imageKey = `menu/${randomId(4)}-${file.name}`
  save(KEYS.images, { ...load(KEYS.images, {}), [imageKey]: dataUrl })
  return { imageKey, imageUrl: dataUrl }
}

function resizeImage(file, maxSize) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.8))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new ApiError(400, 'อ่านไฟล์รูปไม่ได้'))
    }
    img.src = url
  })
}

export async function createOrder({ customerName, contact = '', note = '', items }) {
  await delay()
  if (!customerName?.trim()) throw new ApiError(400, 'กรุณาใส่ชื่อผู้สั่ง')
  if (!items?.length) throw new ApiError(400, 'ตะกร้าว่าง')

  const menu = loadMenu()
  const orderItems = items.map(({ menuId, qty }) => {
    const m = menu.find((x) => x.menuId === menuId)
    if (!m) throw new ApiError(400, `ไม่พบเมนู ${menuId}`)
    if (!m.available) throw new ApiError(400, `"${m.name}" หมดแล้ว`)
    if (!Number.isInteger(qty) || qty < 1) throw new ApiError(400, 'จำนวนไม่ถูกต้อง')
    return { menuId, name: m.name, price: m.price, qty }
  })

  const at = nowIso()
  const datePart = at.slice(0, 10).replaceAll('-', '')
  const order = {
    orderId: `o-${datePart}-${randomId(4)}`,
    queueNumber: null,
    customerName: customerName.trim(),
    contact: contact.trim(),
    note: note.trim(),
    items: orderItems,
    total: orderItems.reduce((sum, i) => sum + i.price * i.qty, 0),
    status: 'PENDING',
    statusHistory: [{ status: 'PENDING', at }],
    createdAt: at,
    updatedAt: at,
  }
  save(KEYS.orders, [...load(KEYS.orders, []), order])
  return order
}

export async function getOrder(orderId) {
  await delay()
  const order = loadOrdersProcessed().find((o) => o.orderId === orderId)
  if (!order) throw new ApiError(404, 'ไม่พบออเดอร์นี้')
  return order
}

export async function listOrders(statuses) {
  await delay()
  return loadOrdersProcessed()
    .filter((o) => !statuses?.length || statuses.includes(o.status))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

export async function updateOrderStatus(orderId, status) {
  await delay()
  const orders = loadOrdersProcessed()
  const order = orders.find((o) => o.orderId === orderId)
  if (!order) throw new ApiError(404, 'ไม่พบออเดอร์นี้')
  if (!NEXT_STATUS[order.status]?.includes(status)) {
    throw new ApiError(409, `Cannot change status from ${order.status} to ${status}`)
  }
  const at = nowIso()
  order.status = status
  order.updatedAt = at
  order.statusHistory.push({ status, at })
  save(KEYS.orders, orders)
  return order
}

export function resetMockData() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k))
}
