import { CheckCircle2 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useOrders } from '../hooks/useTiaraData'
import { formatCurrency } from '../lib/format'

export function SuccessPage() {
  const { orderId = '' } = useParams()
  const { data: orders = [] } = useOrders()
  const order = orders.find((entry) => entry.id === orderId)
  const firstItem = order?.items[0]

  return (
    <div className="page-stack">
      <section className="success-panel">
        <CheckCircle2 size={48} />
        <span className="section-kicker">Order placed</span>
        <h1>Your beauty edit is on its way</h1>
        <p>
          This is a demo checkout, so the magic is in the story: we close the loop by nudging
          you back into community once the purchase moment lands.
        </p>
        <div className="summary-card">
          <div>
            <span>Order total</span>
            <strong>{formatCurrency(order?.total ?? 0)}</strong>
          </div>
          <div>
            <span>Payment mode</span>
            <strong>{order?.paymentMode}</strong>
          </div>
          <div>
            <span>Delivering to</span>
            <strong>{order?.addressLabel}</strong>
          </div>
        </div>
        <Link
          to={`/create${firstItem ? `?productId=${firstItem.productId}&type=Product%20Talk` : ''}`}
          className="primary-button"
        >
          Share your first impressions
        </Link>
      </section>
    </div>
  )
}
