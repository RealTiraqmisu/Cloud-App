export default function QtyStepper({ qty, onChange, disabled = false }) {
  return (
    <div className="stepper">
      <button type="button" onClick={() => onChange(qty - 1)} disabled={disabled} aria-label="ลดจำนวน">
        −
      </button>
      <span aria-live="polite">{qty}</span>
      <button type="button" onClick={() => onChange(qty + 1)} disabled={disabled || qty >= 99} aria-label="เพิ่มจำนวน">
        +
      </button>
    </div>
  )
}
