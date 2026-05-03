import { Menu, MessageCircle, Search, ShoppingCart, Wallet, X, Package, MapPin, CreditCard, HelpCircle, Settings, LogOut, Bell } from 'lucide-react'
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
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [searchExpanded, setSearchExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const mainRef = useRef<HTMLElement>(null)

  // Scroll to top on every route change
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'instant' })
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
    setMenuOpen(false)
  }, [location.pathname, location.search])

  // Mock notifications
  const notifications = [
    { id: 'n1', type: 'comment', text: 'Rhea Kapoor commented on your post "My full dewy office makeup routine"', time: '2 hours ago', read: false },
    { id: 'n2', type: 'follow', text: 'New post about Dot & Key Watermelon Sunscreen', time: '5 hours ago', read: false },
    { id: 'n3', type: 'like', text: 'Naina Rao liked your comment', time: '1 day ago', read: true },
    { id: 'n4', type: 'reply', text: 'Simran Kaur replied to your comment on "Dark circles getting worse"', time: '2 days ago', read: true },
  ]

  const unreadCount = notifications.filter(n => !n.read).length

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
            {searchExpanded ? (
              <div className="search-expanded">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search feed, products, brands, ingredients or more"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={() => !searchQuery && setSearchExpanded(false)}
                  autoFocus
                />
                <button
                  className="icon-button"
                  type="button"
                  onClick={() => { setSearchExpanded(false); setSearchQuery('') }}
                  aria-label="Close search"
                  style={{ width: '32px', height: '32px' }}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                className="icon-button"
                type="button"
                aria-label="Search"
                onClick={() => setSearchExpanded(true)}
              >
                <Search size={18} />
              </button>
            )}

            <button
              className="icon-button inbox-icon-button"
              type="button"
              aria-label="Notifications"
              onClick={() => setNotificationsOpen(true)}
            >
              <Bell size={18} />
              {unreadCount > 0 && <span className="inbox-dot" />}
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

        {/* Notifications dropdown */}
        {notificationsOpen && (
          <>
            <div className="drawer-overlay" onClick={() => setNotificationsOpen(false)} style={{ background: 'transparent' }} />
            <div className="notif-dropdown">
              <div className="notif-dropdown-header">
                <h3 className="notif-dropdown-title">Notifications</h3>
                <button
                  className="icon-button"
                  type="button"
                  onClick={() => setNotificationsOpen(false)}
                  aria-label="Close notifications"
                  style={{ width: '28px', height: '28px' }}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="notif-dropdown-list">
                {notifications.map((notif) => (
                  <button
                    key={notif.id}
                    type="button"
                    className="notif-item"
                    onClick={() => setNotificationsOpen(false)}
                    style={{ opacity: notif.read ? 0.7 : 1 }}
                  >
                    <div className="notif-content">
                      <p className="notif-text">{notif.text}</p>
                      <span className="notif-time">{notif.time}</span>
                    </div>
                    {!notif.read && <div className="notif-unread-dot" />}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
