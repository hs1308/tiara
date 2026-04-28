import { ArrowUpRight, CreditCard, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCurrentUser, useOrders } from '../hooks/useTiaraData'
import { formatCurrency, formatDate } from '../lib/format'

export function WalletPage() {
  const { data: user } = useCurrentUser()
  const { data: orders = [] } = useOrders()

  return (
    <div className="page-stack">
      <section className="wallet-hero">
        <span className="section-kicker">Wallet</span>
        <h1>{formatCurrency(user?.walletBalance ?? 0)}</h1>
        <p>
          Demo credits earned from karma and applied during checkout. The flow is intentionally
          lightweight, but the value loop is visible.
        </p>
      </section>
      <section className="details-grid">
        <article className="detail-card">
          <Sparkles size={18} />
          <h3>Karma to credit</h3>
          <p>10 karma = Rs. 1 credit. No expiry in the prototype.</p>
        </article>
        <article className="detail-card">
          <CreditCard size={18} />
          <h3>Last applied</h3>
          <p>Used during the most recent checkout to soften price resistance.</p>
        </article>
      </section>
      <section className="section-block section-tight">
        <div className="section-head">
          <div>
            <span className="section-kicker">Recent activity</span>
            <h2>Credits feel tied to commerce, not hidden in a dead-end screen</h2>
          </div>
          <Link to="/shop" className="inline-link">
            Shop again <ArrowUpRight size={15} />
          </Link>
        </div>
        <div className="feed-stack">
          {orders.length ? (
            orders.map((order) => (
              <article className="comment-card" key={order.id}>
                <strong>{formatCurrency(order.walletApplied)} used</strong>
                <span className="meta-line">{formatDate(order.createdAt)}</span>
                <p>{order.addressLabel}</p>
              </article>
            ))
          ) : (
            <div className="empty-state">Place an order to populate wallet activity.</div>
          )}
        </div>
      </section>
    </div>
  )
}
