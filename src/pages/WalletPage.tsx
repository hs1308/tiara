import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCurrentUser, useOrders } from '../hooks/useTiaraData'
import { formatCurrency, formatDate } from '../lib/format'

export function WalletPage() {
  const { data: user } = useCurrentUser()
  const { data: orders = [] } = useOrders()

  return (
    <div className="page-stack">

      {/* ── Balance + Karma row ── */}
      <section className="section-block">
        <div className="wallet-stats-row">
          <div className="wallet-stat">
            <span className="section-kicker">Wallet balance</span>
            <strong className="wallet-stat-value">{formatCurrency(user?.walletBalance ?? 0)}</strong>
          </div>
          <div className="wallet-stat wallet-stat-right">
            <span className="section-kicker">Karma points</span>
            <strong className="wallet-stat-value">{user?.karma ?? 0}</strong>
          </div>
        </div>

        {/* ── How it works ── */}
        <div className="wallet-explainer">
          <p>Each upvote on a post or comment earns you <strong>1 karma point.</strong></p>
          <ul className="wallet-rate-list">
            <li>First 20 karma on any post or comment → <strong>₹0.50</strong> per karma</li>
            <li>21 – 100 karma → <strong>₹0.20</strong> per karma</li>
            <li>100+ karma → <strong>₹0.10</strong> per karma</li>
          </ul>
          <p className="wallet-note">Credits never expire. Applied automatically at checkout.</p>
        </div>
      </section>

      {/* ── Recent activity ── */}
      <section className="section-block section-tight">
        <div className="section-head">
          <div>
            <span className="section-kicker">Recent activity</span>
            <h2>Wallet usage</h2>
          </div>
          <Link to="/shop" className="inline-link">
            Shop <ArrowUpRight size={15} />
          </Link>
        </div>
        <div className="feed-stack">
          {orders.length ? (
            orders.map((order) => (
              <article className="comment-card" key={order.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px' }}>
                  <strong>{formatCurrency(order.walletApplied)} used</strong>
                  <span className="meta-line">{formatDate(order.createdAt)}</span>
                </div>
                <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: '0.88rem' }}>{order.addressLabel}</p>
              </article>
            ))
          ) : (
            <div className="empty-state">Place an order to see wallet activity here.</div>
          )}
        </div>
      </section>

    </div>
  )
}
