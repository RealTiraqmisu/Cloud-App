// Real backend: API Gateway → Lambda. Contract: docs/API.md
import { API_URL } from '../config'
import { ApiError } from './errors'

async function request(method, path, body) {
  let res
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(0, 'เชื่อมต่อ API ไม่ได้ (ตรวจ URL / CORS / อินเทอร์เน็ต)')
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new ApiError(res.status, data.error || `เกิดข้อผิดพลาด (HTTP ${res.status})`)
  }
  return data
}

function toMenuBody(item) {
  const { name, description = '', price, category = '', imageKey = null, available = true } = item
  return { name, description, price: Number(price), category, imageKey, available }
}

export async function listMenu() {
  return (await request('GET', '/menu')).items
}

export async function createMenuItem(item) {
  return (await request('POST', '/menu', toMenuBody(item))).item
}

export async function updateMenuItem(menuId, item) {
  return (await request('PUT', `/menu/${encodeURIComponent(menuId)}`, toMenuBody(item))).item
}

export async function deleteMenuItem(menuId) {
  await request('DELETE', `/menu/${encodeURIComponent(menuId)}`)
}

export async function uploadMenuImage(file) {
  const { uploadUrl, imageKey, imageUrl } = await request('POST', '/menu/upload-url', {
    fileName: file.name,
    contentType: file.type,
  })
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  }).catch(() => null)
  if (!res?.ok) throw new ApiError(res?.status ?? 0, 'อัปโหลดรูปขึ้น S3 ไม่สำเร็จ (ตรวจ CORS ของ bucket)')
  return { imageKey, imageUrl }
}

export async function createOrder(order) {
  return (await request('POST', '/orders', order)).order
}

export async function getOrder(orderId) {
  return (await request('GET', `/orders/${encodeURIComponent(orderId)}`)).order
}

export async function listOrders(statuses) {
  const qs = statuses?.length ? `?status=${statuses.join(',')}` : ''
  return (await request('GET', `/orders${qs}`)).orders
}

export async function updateOrderStatus(orderId, status) {
  return (await request('PATCH', `/orders/${encodeURIComponent(orderId)}/status`, { status })).order
}
