// The call-board plate: queue numbers are always yellow numerals on board green.
export default function QueuePlate({ number, size = 'sm', label }) {
  const empty = number == null
  if (size === 'lg') {
    return (
      <div className="plate plate-lg">
        <span className="plate-label">{label ?? 'คิวของคุณ'}</span>
        <span className={`plate-number${empty ? ' plate-empty' : ''}`} aria-live="polite">
          {empty ? '–' : number}
        </span>
      </div>
    )
  }
  return (
    <span
      className={`plate plate-${size}${empty ? ' plate-empty' : ''}`}
      aria-label={empty ? 'ยังไม่ได้เลขคิว' : `คิว ${number}`}
    >
      {empty ? '–' : number}
    </span>
  )
}
