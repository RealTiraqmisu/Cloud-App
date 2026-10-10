import { useEffect, useState } from 'react'
import { api } from '../api'
import MenuImage from '../components/MenuImage'
import { formatPrice } from '../utils/format'

const EMPTY_FORM = { name: '', description: '', price: '', category: '', imageKey: null, imageUrl: null, available: true }
const MAX_IMAGE_MB = 5

export default function AdminPage() {
  const [menu, setMenu] = useState(null)
  const [error, setError] = useState(null)
  const [editingId, setEditingId] = useState(null) // null = closed, 'new' = create
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formError, setFormError] = useState(null)

  const load = () => api.listMenu().then(setMenu).catch(setError)
  useEffect(() => {
    load()
  }, [])

  const categories = [...new Set((menu ?? []).map((m) => m.category).filter(Boolean))]

  function openNew() {
    setForm(EMPTY_FORM)
    setEditingId('new')
    setFormError(null)
  }

  function openEdit(item) {
    setForm({ ...EMPTY_FORM, ...item, price: String(item.price) })
    setEditingId(item.menuId)
    setFormError(null)
  }

  const update = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  async function onImage(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) return setFormError('รองรับเฉพาะไฟล์รูปภาพ')
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) return setFormError(`รูปต้องไม่เกิน ${MAX_IMAGE_MB} MB`)
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
      if (editingId === 'new') await api.createMenuItem(form)
      else await api.updateMenuItem(editingId, form)
      setEditingId(null)
      await load()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function toggleAvailable(item) {
    try {
      await api.updateMenuItem(item.menuId, { ...item, available: !item.available })
      await load()
    } catch (err) {
      setError(err)
    }
  }

  async function remove(item) {
    if (!window.confirm(`ลบเมนู "${item.name}" ?`)) return
    try {
      await api.deleteMenuItem(item.menuId)
      await load()
    } catch (err) {
      setError(err)
    }
  }

  return (
    <div>
      <div className="page-head row">
        <div>
          <h1>จัดการเมนู</h1>
          <p className="muted">เพิ่ม/แก้ไขเมนู อัปโหลดรูป (เก็บใน S3) และปิดเมนูที่หมด</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openNew}>
          + เพิ่มเมนู
        </button>
      </div>

      {error && <div className="alert error">{error.message}</div>}

      <div className="card table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>เมนู</th>
              <th>หมวด</th>
              <th className="num">ราคา</th>
              <th>สถานะ</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {!menu && !error && (
              <tr>
                <td colSpan={5} className="muted">กำลังโหลด…</td>
              </tr>
            )}
            {menu?.length === 0 && (
              <tr>
                <td colSpan={5} className="muted">ยังไม่มีเมนู</td>
              </tr>
            )}
            {menu?.map((item) => (
              <tr key={item.menuId} className={item.available ? '' : 'row-muted'}>
                <td>
                  <div className="admin-item">
                    <MenuImage item={item} className="thumb" />
                    <div>
                      <div>{item.name}</div>
                      {item.description && <div className="muted small">{item.description}</div>}
                    </div>
                  </div>
                </td>
                <td>{item.category || '-'}</td>
                <td className="num">{formatPrice(item.price)}</td>
                <td>
                  <label className="toggle">
                    <input type="checkbox" checked={item.available} onChange={() => toggleAvailable(item)} />
                    <span>{item.available ? 'มีขาย' : 'หมด'}</span>
                  </label>
                </td>
                <td className="actions">
                  <button type="button" className="btn btn-sm" onClick={() => openEdit(item)}>แก้ไข</button>
                  <button type="button" className="btn btn-sm btn-danger-ghost" onClick={() => remove(item)}>ลบ</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingId && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="menu-form-title">
          <form className="modal menu-form" onSubmit={save}>
            <h2 id="menu-form-title">{editingId === 'new' ? 'เพิ่มเมนู' : 'แก้ไขเมนู'}</h2>

            <div className="image-picker">
              <MenuImage item={form} className="preview" />
              <label className="btn btn-sm">
                {uploading ? 'กำลังอัปโหลด…' : form.imageUrl ? 'เปลี่ยนรูป' : 'อัปโหลดรูป'}
                <input type="file" accept="image/*" hidden onChange={onImage} disabled={uploading} />
              </label>
              {form.imageKey && (
                <button type="button" className="btn btn-sm btn-danger-ghost" onClick={() => setForm((f) => ({ ...f, imageKey: null, imageUrl: null }))}>
                  เอารูปออก
                </button>
              )}
            </div>

            <label className="field">
              <span>ชื่อเมนู *</span>
              <input required maxLength={80} value={form.name} onChange={update('name')} />
            </label>
            <label className="field">
              <span>รายละเอียด</span>
              <input maxLength={150} value={form.description} onChange={update('description')} />
            </label>
            <div className="field-row">
              <label className="field">
                <span>ราคา (บาท) *</span>
                <input required type="number" min="0" step="0.5" inputMode="decimal" value={form.price} onChange={update('price')} />
              </label>
              <label className="field">
                <span>หมวด</span>
                <input list="category-options" maxLength={40} value={form.category} onChange={update('category')} />
                <datalist id="category-options">
                  {categories.map((c) => <option key={c} value={c} />)}
                </datalist>
              </label>
            </div>
            <label className="toggle">
              <input type="checkbox" checked={form.available} onChange={update('available')} />
              <span>มีขาย</span>
            </label>

            {formError && <div className="alert error small">{formError}</div>}

            <div className="modal-actions">
              <button type="button" className="btn" onClick={() => setEditingId(null)} disabled={saving}>ยกเลิก</button>
              <button type="submit" className="btn btn-primary" disabled={saving || uploading}>
                {saving ? 'กำลังบันทึก…' : 'บันทึก'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
