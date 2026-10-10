import { useState } from 'react'
import { categoryEmoji } from '../utils/format'

export default function MenuImage({ item, className = '' }) {
  const [broken, setBroken] = useState(false)
  if (item.imageUrl && !broken) {
    return (
      <img
        className={`menu-img ${className}`}
        src={item.imageUrl}
        alt={item.name}
        loading="lazy"
        onError={() => setBroken(true)}
      />
    )
  }
  return (
    <div className={`menu-img menu-img-placeholder ${className}`} aria-hidden="true">
      {categoryEmoji(item.category)}
    </div>
  )
}
