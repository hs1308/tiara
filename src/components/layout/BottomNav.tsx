import { Home, PlusSquare, ShoppingBag, UserRound, UsersRound } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/utils'

const items = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/feed', label: 'Feed', icon: UsersRound },
  { to: '/create', label: 'Post', icon: PlusSquare, isCenter: true },
  { to: '/shop', label: 'Shop', icon: ShoppingBag },
  { to: '/profile', label: 'Profile', icon: UserRound },
]

export function BottomNav() {
  return (
    <nav className="bottom-nav">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn('bottom-nav-item', isActive && 'is-active', item.isCenter && 'is-center')
            }
          >
            <Icon size={item.isCenter ? 18 : 17} />
            <span>{item.label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}
