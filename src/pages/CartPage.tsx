import { Minus, Plus, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart, useCurrentUser, useProducts, useUpdateCartItem } from '../hooks/useTiaraData'
import { formatCurrency } from '../lib/format'
import { useDemoApp } from '../state/useDemoApp'

export function CartPage() {
  const { data: cartItems = [] } = useCart()
  const { data: products = [] } = useProducts()
  const { data: user } = useCurrentUser()
  const { checkoutWalletApplied } = useDemoApp()
  const updateCartItem = useUpdateCartItem()

  const enrichedItems = cartItems
    .map((item) => ({
      ...item,
      product: products.find((product) => product.id === item.productId),
    }))
    .filter((item) => item.product)

  const subtotal = enrichedItems.reduce(
    (sum, item) => sum + (item.product?.price ?? 0) * item.quantity,
    0,
  )
  const total = Math.max(subtotal - checkoutWalletApplied, 0)

  return (
    <div className="page-stack">
      <section className="section-block">
        <div className="section-head">
          <div>
            <span className="section-kicker">Cart</span>
            <h2>{cartItems.length} items lined up for checkout</h2>
          </div>
        </div>
        <div className="cart-stack">
          {enrichedItems.map((item) => (
            <article className="cart-card" key={item.id}>
              <img src={item.product?.heroImage} alt={item.product?.name} className="cart-image" />
              <div className="cart-copy">
                <strong>{item.product?.brand}</strong>
                <span>{item.product?.name}</span>
                <div className="price-row">
                  <strong>{formatCurrency((item.product?.price ?? 0) * item.quantity)}</strong>
                </div>
              </div>
              <div className="qty-stepper">
                <button
                  type="button"
                  onClick={() =>
                    updateCartItem.mutate({ itemId: item.id, quantity: item.quantity - 1 })
                  }
                >
                  <Minus size={14} />
                </button>
                <span>{item.quantity}</span>
                <button
                  type="button"
                  onClick={() =>
                    updateCartItem.mutate({ itemId: item.id, quantity: item.quantity + 1 })
                  }
                >
                  <Plus size={14} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block section-tight">
        <div className="wallet-banner">
          <Wallet size={16} />
          <div>
            <strong>{formatCurrency(user?.walletBalance ?? 0)} wallet balance</strong>
            <span>{formatCurrency(checkoutWalletApplied)} will be applied at checkout</span>
          </div>
        </div>
        <div className="summary-card">
          <div>
            <span>Subtotal</span>
            <strong>{formatCurrency(subtotal)}</strong>
          </div>
          <div>
            <span>Wallet credit</span>
            <strong>-{formatCurrency(checkoutWalletApplied)}</strong>
          </div>
          <div className="summary-total">
            <span>Total</span>
            <strong>{formatCurrency(total)}</strong>
          </div>
          <Link to="/checkout" className="primary-button full">
            Continue to checkout
          </Link>
        </div>
      </section>
    </div>
  )
}
