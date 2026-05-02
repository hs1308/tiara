import { Menu, MessageCircle, Search, ShoppingCart, Wallet, X, Package, MapPin, CreditCard, HelpCircle, Settings, LogOut } from 'lucide-react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useCartCount, useCurrentUser } from '../../hooks/useTiaraData'
import { formatCurrency } from '../../lib/format'
import { BottomNav } from './BottomNav'
import { MessagingProvider, useMessaging } from '../../state/MessagingContext'
import '../../styles/app.css'

const MENU_ITEMS = [
  { icon: Package,   label: 'My Orders',       path: '/orders' },
  { icon: MapPin,    label: 'My Addresses',     path: '/addresses' },
  { icon: CreditCard,label: 'My Wallet',        path: '/wallet' },
  { icon: HelpCircle,label: 'Help & Support',   path: '/help' },
  { icon: Settings,  label: 'Account Settings', path: '/settings' },
]

export function AppShell() {
  return (
    <MessagingProvider>
      <AppShellInner />
    </MessagingProvider>
  )
}

function AppShellInner() {
  const navigate = useNavigate()
  const location = useLocation()
  const { data: currentUser } = useCurrentUser()
  const cartCount = useCartCount()
  const { conversations } = useMessaging()
  const hasMessages = conversations.length > 0
  const [menuOpen, setMenuOpen] = useState(false)
  const mainRef = useRef<HTMLElement>(null)

  // Scroll to top on every route change
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'instant' })
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
    setMenuOpen(false)
  }, [location.pathname, location.search])

  const titleMap: Record<string, string> = {
    '/':        'Tiara',
    '/feed':    'Community',
    '/shop':    'Discover',
    '/cart':    'Cart',
    '/wallet':  'Wallet',
    '/checkout':'Checkout',
    '/create':  'Create',
    '/profile': 'Profile',
    '/inbox':   'Messages',
  }

  const pageTitle =
    Object.entries(titleMap).find(([path]) => location.pathname === path)?.[1] ?? 'Tiara'

  return (
    <div className="app-frame">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />
      <div className="app-shell">
        <header className="topbar">
          <button
            className="icon-button"
            type="button"
            aria-label="Menu"
            onClick={() => setMenuOpen(true)}
          >
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

            <button
              className="icon-button inbox-icon-button"
              type="button"
              aria-label="Inbox"
              onClick={() => navigate('/inbox')}
            >
              <MessageCircle size={18} />
              {hasMessages && <span className="inbox-dot" />}
            </button>

            <button
              className="icon-button cart-icon-button"
              type="button"
              aria-label="Cart"
              onClick={() => navigate('/cart')}
            >
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="cart-badge">{cartCount > 9 ? '9+' : cartCount}</span>
              )}
            </button>

            <button className="wallet-pill" type="button" onClick={() => navigate('/wallet')}>
              <Wallet size={16} />
              <span>{formatCurrency(currentUser?.walletBalance ?? 0)}</span>
            </button>
          </div>
        </header>

        <main ref={mainRef} className="app-main">
          <Outlet />
        </main>

        <BottomNav />

        {/* Hamburger drawer */}
        {menuOpen && (
          <div className="drawer-overlay" onClick={() => setMenuOpen(false)}>
            <div className="drawer" onClick={(e) => e.stopPropagation()}>
              <div className="drawer-header">
                <div className="drawer-user">
                  {currentUser?.avatar && (
                    <img src={currentUser.avatar} alt={currentUser.name} className="avatar-sm" />
                  )}
                  <div>
                    <div className="author-name">{currentUser?.name ?? 'Aanya Mehra'}</div>
                    <div className="meta-line">@{currentUser?.username ?? 'aanyam'}</div>
                  </div>
                </div>
                <button
                  className="icon-button"
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>

              <nav className="drawer-nav">
                {MENU_ITEMS.map(({ icon: Icon, label, path }) => (
                  <button
                    key={path}
                    type="button"
                    className="drawer-item"
                    onClick={() => { navigate(path); setMenuOpen(false) }}
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                  </button>
                ))}
              </nav>

              <div className="drawer-footer">
                <button
                  type="button"
                  className="drawer-item drawer-item-danger"
                  onClick={() => setMenuOpen(false)}
                >
                  <LogOut size={18} />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
