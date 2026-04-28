import { Menu, Search, Wallet } from 'lucide-react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useCurrentUser } from '../../hooks/useTiaraData'
import { formatCurrency } from '../../lib/format'
import { BottomNav } from './BottomNav'
import '../../styles/app.css'

export function AppShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const { data: currentUser } = useCurrentUser()

  const titleMap: Record<string, string> = {
    '/': 'Tiara',
    '/feed': 'Community',
    '/shop': 'Shop',
    '/cart': 'Cart',
    '/wallet': 'Wallet',
    '/checkout': 'Checkout',
    '/create': 'Create',
    '/profile': 'Profile',
  }

  const pageTitle =
    Object.entries(titleMap).find(([path]) => location.pathname === path)?.[1] ??
    'Tiara'

  return (
    <div className="app-frame">
      <div className="ambient ambient-left"></div>
      <div className="ambient ambient-right"></div>
      <div className="app-shell">
        <header className="topbar">
          <button className="icon-button" type="button" aria-label="Menu">
            <Menu size={18} />
          </button>
          <button className="brand-lockup" type="button" onClick={() => navigate('/')}>
            <span className="brand-wordmark">Tiara</span>
            <span className="brand-subtitle">{pageTitle}</span>
          </button>
          <div className="topbar-actions">
            <button className="icon-button" type="button" aria-label="Search">
              <Search size={18} />
            </button>
            <button className="wallet-pill" type="button" onClick={() => navigate('/wallet')}>
              <Wallet size={16} />
              <span>{formatCurrency(currentUser?.walletBalance ?? 0)}</span>
            </button>
          </div>
        </header>
        <main className="app-main">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  )
}
