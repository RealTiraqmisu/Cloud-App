import { CupSoda, Drumstick, IceCreamBowl, Soup, Utensils, UtensilsCrossed } from 'lucide-react'
import { useState } from 'react'

const CATEGORY_ICON = {
  อาหารจานเดียว: UtensilsCrossed,
  เส้น: Soup,
  ของทานเล่น: Drumstick,
  เครื่องดื่ม: CupSoda,
  ของหวาน: IceCreamBowl,
}

// Square dish thumbnail. Without a photo, a drawn category icon stands in.
export default function MenuImage({ item, className = '' }) {
  const [broken, setBroken] = useState(false)
  if (item.imageUrl && !broken) {
    return (
      <img
        className={`dish-thumb ${className}`}
        src={item.imageUrl}
        alt=""
        loading="lazy"
        onError={() => setBroken(true)}
      />
    )
  }
  const Icon = CATEGORY_ICON[item.category] ?? Utensils
  return (
    <div className={`dish-thumb thumb-placeholder ${className}`} aria-hidden="true">
      <Icon size={32} strokeWidth={1.75} />
    </div>
  )
}
