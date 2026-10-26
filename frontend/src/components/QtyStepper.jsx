import { Minus, Plus, Trash2 } from 'lucide-react'

// At qty 1 the minus becomes "remove" so the last tap clearly takes the dish out.
export default function QtyStepper({ qty, onChange, disabled = false, name = '' }) {
  const removing = qty <= 1
  return (
    <div className="stepper" role="group" aria-label={name ? `จำนวน ${name}` : 'จำนวน'}>
      <button
        type="button"
        onClick={() => onChange(qty - 1)}
        disabled={disabled}
        aria-label={removing ? 'เอาออกจากตะกร้า' : 'ลดจำนวน'}
      >
        {removing ? <Trash2 size={18} aria-hidden="true" /> : <Minus size={18} aria-hidden="true" />}
      </button>
      <output aria-live="polite">{qty}</output>
      <button type="button" onClick={() => onChange(qty + 1)} disabled={disabled || qty >= 99} aria-label="เพิ่มจำนวน">
        <Plus size={18} aria-hidden="true" />
      </button>
    </div>
  )
}
