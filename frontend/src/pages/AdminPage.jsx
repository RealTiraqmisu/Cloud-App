import { CircleAlert, ImagePlus, LoaderCircle, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../api'
import { USE_MOCK } from '../config'
import ConfirmDialog from '../components/ConfirmDialog'
import MenuImage from '../components/MenuImage'
import { formatPrice } from '../utils/format'

const EMPTY_FORM = { name: '', description: '', price: '', category: '', imageKey: null, imageUrl: null, available: true }
const MAX_IMAGE_MB = 5

export default function AdminPage() {
  const [menu, setMenu] = useState(null)
  const [error, setError] = useState(null)
  const [editingId, setEditingId] = useState(null) // null = closed, 'new' = create
  const [deleting, setDeleting] = useState(null) // item pending delete confirmation
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [toggling, setToggling] = useState({})

  const load = useCallback(() => api.listMenu().then(setMenu).catch(setError), [])
  useEffect(() => {
    load()
  }, [load])

  const categories = [...new Set((menu ?? []).map((m) => m.category).filter(Boolean))]
  const soldOut = (menu ?? []).filter((m) => !m.available).length
  const closeDelete = useCallback(() => setDeleting(null), [])
  const closeEditor = useCallback(() => setEditingId(null), [])

  async function toggleAvailable(item) {
    const flip = (available) => setMenu((m) => m?.map((x) => (x.menuId === item.menuId ? { ...x, available } : x)))
    setToggling((t) => ({ ...t, [item.menuId]: true }))
    flip(!item.available) // optimistic: the switch moves immediately
    try {
      await api.updateMenuItem(item.menuId, { ...item, available: !item.available })
      await load()
    } catch (err) {
      flip(item.available)
      setError(err)
    } finally {
      setToggling((t) => ({ ...t, [item.menuId]: false }))
    }
  }

  async function confirmDelete() {
    setDeleteBusy(true)
    try {
      await api.deleteMenuItem(deleting.menuId)
      await load()
      setDeleting(null)
    } catch (err) {
      setError(err)
      setDeleting(null)
    } finally {
      setDeleteBusy(false)
    }
  }

  return (
    <div className="page">
      <div className="page-head row">
        <div>
          <h1>จัดการเมนู</h1>
          {menu && (
            <div className="admin-summary">
              <span>ทั้งหมด {menu.length} รายการ</span>
              <span>หมด {soldOut} รายการ</span>
            </div>
          )}
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setEditingId('new')}>
          <Plus size={18} aria-hidden="true" />
          เพิ่มเมนู
        </button>
      </div>

      {error && (
        <div className="alert alert-error" role="alert">
          <CircleAlert size={18} aria-hidden="true" />
          <span>{error.message}</span>
        </div>
      )}

      <div className="admin-list" role="table" aria-label="รายการเมนู">
        <div className="admin-list-head" role="row">
          <span role="columnheader">
            <span className="visually-hidden">รูป</span>
          </span>
          <span role="columnheader">เมนู</span>
          <span role="columnheader">หมวด</span>
          <span role="columnheader" className="num">ราคา</span>
          <span role="columnheader">มีขายอยู่ไหม</span>
          <span role="columnheader">
            <span className="visually-hidden">จัดการ</span>
          </span>
        </div>

        {!menu && !error && (
          <div className="admin-row" role="row" aria-busy="true">
            <div className="dish-thumb skeleton" />
            <div className="skeleton" style={{ height: 18, width: '60%' }} />
          </div>
        )}
        {menu?.length === 0 && (
          <div className="empty-state" role="row">
            <strong>ยังไม่มีเมนู</strong>
            <span>กด “เพิ่มเมนู” เพื่อเริ่มสร้างเมนูแรก</span>
          </div>
        )}

        {menu?.map((item) => (
          <div key={item.menuId} role="row" className={`admin-row${item.available ? '' : ' is-sold-out'}`}>
            <span role="cell">
              <MenuImage item={item} />
            </span>
            <div role="cell">
              <div className="admin-row-name">{item.name}</div>
              {item.description && <div className="admin-row-desc">{item.description}</div>}
            </div>
            <div className="admin-row-controls">
              <span role="cell" className="admin-row-cat">{item.category || 'ไม่มีหมวด'}</span>
              <span role="cell" className="price">{formatPrice(item.price)}</span>
              <span role="cell">
                <button
                  type="button"
                  role="switch"
                  className="switch"
                  aria-checked={item.available}
                  aria-label={`${item.name} มีขาย`}
                  disabled={!!toggling[item.menuId]}
                  onClick={() => toggleAvailable(item)}
                >
                  <span className="switch-track" aria-hidden="true" />
                  {item.available ? 'มีขาย' : 'หมด'}
                </button>
              </span>
              <span role="cell" className="actions">
                <button type="button" className="btn btn-quiet" onClick={() => setEditingId(item.menuId)}>
                  <Pencil size={16} aria-hidden="true" />
                  แก้ไข
                </button>
                <button type="button" className="btn btn-danger-quiet" onClick={() => setDeleting(item)} aria-label={`ลบ ${item.name}`}>
                  <Trash2 size={16} aria-hidden="true" />
                  ลบ
                </button>
              </span>
            </div>
          </div>
        ))}
      </div>

      {USE_MOCK && (
        <p className="dev-hint">
          โหมดทดลอง: เมนูและรูปเก็บในเบราว์เซอร์นี้เท่านั้น ตั้งค่า <code>VITE_API_URL</code> (ดู frontend/README.md) เพื่อเชื่อมกับ API บน AWS
        </p>
      )}

      {editingId && (
        <MenuEditor
          item={editingId === 'new' ? null : menu?.find((m) => m.menuId === editingId)}
          categories={categories}
          onClose={closeEditor}
          onSaved={async () => {
            setEditingId(null)
            await load()
          }}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title={`ลบ “${deleting.name}”?`}
          body="เมนูนี้จะหายจากหน้าสั่งอาหารทันที ถ้าแค่ของหมดชั่วคราว ให้ปิด “มีขาย” แทน"
          confirmLabel="ลบเมนู"
          cancelLabel="เก็บไว้"
          danger
          busy={deleteBusy}
          onConfirm={confirmDelete}
          onCancel={closeDelete}
        />
      )}
    </div>
  )
}

function MenuEditor({ item, categories, onClose, onSaved }) {
  const [form, setForm] = useState(() => (item ? { ...EMPTY_FORM, ...item, price: String(item.price) } : EMPTY_FORM))
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formError, setFormError] = useState(null)
  const firstField = useRef(null)
  const isNew = !item

  useEffect(() => {
    firstField.current?.focus()
    const onKey = (e) => e.key === 'Escape' && !saving && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [saving, onClose])

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  async function onImage(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) return setFormError('รองรับเฉพาะไฟล์รูปภาพ (JPG หรือ PNG)')
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) return setFormError(`รูปใหญ่เกินไป ต้องไม่เกิน ${MAX_IMAGE_MB} MB`)
    setUploading(true)
    setFormError(null)
    try {
      const { imageKey, imageUrl } = await api.uploadMenuImage(file)
      setForm((f) => ({ ...f, imageKey, imageUrl }))
    } catch (err) {
      setFormError(err.message)
    } finally {
      setUploading(false)
    }
  }

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    setFormError(null)
    try {
      if (isNew) await api.createMenuItem(form)
      else await api.updateMenuItem(item.menuId, form)
      await onSaved()
    } catch (err) {
      setFormError(err.message)
      setSaving(false)
    }
  }

  return (
    <div className="dialog-backdrop" onMouseDown={(e) => e.target === e.currentTarget && !saving && onClose()}>
      <form className="dialog dialog-wide" role="dialog" aria-modal="true" aria-labelledby="menu-form-title" onSubmit={save}>
        <div className="cart-head">
          <h2 id="menu-form-title">{isNew ? 'เพิ่มเมนูใหม่' : `แก้ไข ${item.name}`}</h2>
          <button type="button" className="btn btn-quiet btn-icon" onClick={onClose} disabled={saving} aria-label="ปิด">
            <X size={22} aria-hidden="true" />
          </button>
        </div>

        <div className="image-picker">
          <MenuImage item={form} />
          <div className="image-picker-actions">
            <label className="btn btn-tint file-button">
              {uploading ? <LoaderCircle size={18} className="spin" aria-hidden="true" /> : <ImagePlus size={18} aria-hidden="true" />}
              {uploading ? 'กำลังอัปโหลด…' : form.imageUrl ? 'เปลี่ยนรูป' : 'อัปโหลดรูป'}
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onImage} disabled={uploading} />
            </label>
            {form.imageKey && (
              <button type="button" className="btn btn-danger-quiet" onClick={() => setForm((f) => ({ ...f, imageKey: null, imageUrl: null }))}>
                เอารูปออก
              </button>
            )}
            <span className="field-hint">JPG/PNG ไม่เกิน {MAX_IMAGE_MB} MB รูปจะถูกครอปเป็นสี่เหลี่ยมจัตุรัสแบบในตัวอย่าง</span>
          </div>
        </div>

        <label className="field">
          <span className="field-label">ชื่อเมนู</span>
          <input ref={firstField} className="input" required maxLength={80} value={form.name} onChange={update('name')} placeholder="เช่น ข้าวผัดกุ้ง" />
        </label>
        <label className="field">
          <span className="field-label">
            รายละเอียด <span className="optional">ไม่บังคับ · ลูกค้าเห็น</span>
          </span>
          <input className="input" maxLength={150} value={form.description} onChange={update('description')} placeholder="เช่น ไข่ดาว 1 ฟอง เผ็ดน้อย" />
        </label>
        <div className="field-row">
          <label className="field">
            <span className="field-label">ราคา (บาท)</span>
            <input className="input num" required type="number" min="0" step="0.5" inputMode="decimal" value={form.price} onChange={update('price')} />
          </label>
          <label className="field">
            <span className="field-label">หมวด</span>
            <input className="input" list="category-options" maxLength={40} value={form.category} onChange={update('category')} placeholder="เลือกหรือพิมพ์ใหม่" />
            <datalist id="category-options">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </label>
        </div>
        <button
          type="button"
          role="switch"
          className="switch"
          aria-checked={form.available}
          onClick={() => setForm((f) => ({ ...f, available: !f.available }))}
        >
          <span className="switch-track" aria-hidden="true" />
          {form.available ? 'มีขาย — ลูกค้าสั่งได้' : 'หมด — ลูกค้าเห็นแต่สั่งไม่ได้'}
        </button>

        {formError && (
          <div className="alert alert-error" role="alert" style={{ marginTop: 16, marginBottom: 0 }}>
            <CircleAlert size={18} aria-hidden="true" />
            <span>{formError}</span>
          </div>
        )}

        <div className="dialog-actions">
          <button type="button" className="btn" onClick={onClose} disabled={saving}>
            ยกเลิก
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving || uploading}>
            {saving ? 'กำลังบันทึก…' : isNew ? 'เพิ่มเมนู' : 'บันทึกการแก้ไข'}
          </button>
        </div>
      </form>
    </div>
  )
}
