import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Minus, Plus, Tag, Trash2, Wallet, CheckCircle2, ShoppingBag } from 'lucide-react'
import { useCart, useCurrentUser, usePlaceOrder, useProducts, useRemoveFromCart, useUpdateCartItem } from '../hooks/useTiaraData'
import { formatCurrency } from '../lib/format'

const TAX_RATE = 0.05       // 5% GST
const SERVICE_RATE = 0.02   // 2% platform service charge
const COUPON_CODE = 'TIARA10'
const COUPON_DISCOUNT = 0.10

const addresses = ['Home · Bandra West, Mumbai', 'Work · BKC, Mumbai', 'Parents · Pune']

export function CartPage() {
  const { data: cartItems = [] } = useCart()
  const { data: products = [] } = useProducts()
  const { data: user } = useCurrentUser()
  const updateCartItem = useUpdateCartItem()
  const removeFromCart = useRemoveFromCart()
  const placeOrder = usePlaceOrder()

  const [couponInput, setCouponInput] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [couponError, setCouponError] = useState('')
  const [walletApplied, setWalletApplied] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState(addresses[0])
  const [placing, setPlacing] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null)

  const enrichedItems = cartItems
    .map((item) => ({ ...item, product: products.find((p) => p.id === item.productId) }))
    .filter((item): item is typeof item & { product: NonNullable<typeof item.product> } => !!item.product)

  // Pricing calculations
  const subtotal = enrichedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const couponDiscount = couponApplied ? Math.round(subtotal * COUPON_DISCOUNT) : 0
  const afterCoupon = subtotal - couponDiscount
  const tax = Math.round(afterCoupon * TAX_RATE)
  const serviceCharge = Math.round(afterCoupon * SERVICE_RATE)
  const beforeWallet = afterCoupon + tax + serviceCharge
  const walletBalance = user?.walletBalance ?? 0
  const walletDeduction = walletApplied ? Math.min(walletBalance, beforeWallet) : 0
  const amountDue = Math.max(0, beforeWallet - walletDeduction)
  const paidFullyByWallet = walletApplied && amountDue === 0

  function handleApplyCoupon() {
    if (couponInput.trim().toUpperCase() === COUPON_CODE) {
      setCouponApplied(true)
      setCouponError('')
    } else {
      setCouponError('Invalid coupon code. Try TIARA10.')
    }
  }

  function handleRemoveCoupon() {
    setCouponApplied(false)
    setCouponInput('')
    setCouponError('')
  }

  async function handlePlaceOrder() {
    if (enrichedItems.length === 0) return
    setPlacing(true)
    try {
      const result = await placeOrder.mutateAsync({
        items: enrichedItems.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        subtotal,
        tax,
        serviceCharge,
        couponApplied,
        couponDiscount,
        walletApplied: walletDeduction,
        total: amountDue,
        paymentMode: paidFullyByWallet ? 'Wallet' : 'UPI',
        addressLabel: selectedAddress,
      })
      setOrderSuccess(result.order.id)
    } finally {
      setPlacing(false)
    }
  }

  // Order success state
  if (orderSuccess) {
    const firstItem = enrichedItems[0]
    return (
      <div className="page-stack">
        <section className="success-panel">
          <CheckCircle2 size={48} style={{ color: 'var(--accent)' }} />
          <span className="section-kicker">Order placed</span>
          <h1>Your beauty edit is on its way</h1>
          <p>Delivering to {selectedAddress}. Wallet updated.</p>
          <div className="summary-card">
            <div><span>Order total</span><strong>{formatCurrency(amountDue === 0 ? 0 : amountDue)}</strong></div>
            {walletDeduction > 0 && <div><span>Paid from wallet</span><strong>- {formatCurrency(walletDeduction)}</strong></div>}
            <div className="summary-total"><span>Remaining wallet balance</span><strong>{formatCurrency(Math.max(0, walletBalance - walletDeduction))}</strong></div>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link
              to={`/create${firstItem ? `?productId=${firstItem.productId}&type=Product%20Talk` : ''}`}
              className="primary-button"
            >
              Share your first impressions
            </Link>
            <Link to="/shop" className="secondary-button">
              Continue shopping
            </Link>
          </div>
        </section>
      </div>
    )
  }

  // Empty cart
  if (enrichedItems.length === 0) {
    return (
      <div className="page-stack">
        <section className="success-panel">
          <ShoppingBag size={48} style={{ color: 'var(--muted)' }} />
          <span className="section-kicker">Your cart is empty</span>
          <h1>Nothing here yet</h1>
          <p>Browse products and add them to your cart.</p>
          <Link to="/shop" className="primary-button">Shop now</Link>
        </section>
      </div>
    )
  }

  return (
    <div className="page-stack">

      {/* ── Cart items ── */}
      <section className="section-block">
        <div className="section-head">
          <div>
            <span className="section-kicker">Your cart</span>
            <h2>{enrichedItems.length} {enrichedItems.length === 1 ? 'item' : 'items'}</h2>
          </div>
          <Link to="/shop" className="inline-link">Continue shopping</Link>
        </div>

        <div className="cart-stack">
          {enrichedItems.map((item) => {
            const discount = Math.round(((item.product.originalPrice - item.product.price) / item.product.originalPrice) * 100)
            return (
              <article className="cart-card" key={item.id}>
                <Link to={`/product/${item.product.id}`} className="cart-image-wrap">
                  <img src={item.product.heroImage} alt={item.product.name} className="cart-image" />
                </Link>
                <div className="cart-copy">
                  <span className="eyebrow">{item.product.brand}</span>
                  <Link to={`/product/${item.product.id}`}>
                    <strong className="cart-item-name">{item.product.name}</strong>
                  </Link>
                  <span className="meta-line">{item.product.size}</span>
                  <div className="price-row">
                    <strong>{formatCurrency(item.product.price * item.quantity)}</strong>
                    {item.product.originalPrice > item.product.price && (
                      <span>{formatCurrency(item.product.originalPrice * item.quantity)}</span>
                    )}
                    {discount > 0 && <small>{discount}% off</small>}
                  </div>
                </div>
                <div className="cart-item-controls">
                  <div className="qty-stepper">
                    <button
                      type="button"
                      onClick={() => updateCartItem.mutate({ itemId: item.id, quantity: item.quantity - 1 })}
                      disabled={updateCartItem.isPending}
                    >
                      <Minus size={13} />
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateCartItem.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                      disabled={updateCartItem.isPending}
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                  <button
                    type="button"
                    className="cart-remove-btn"
                    onClick={() => removeFromCart.mutate(item.id)}
                    aria-label="Remove item"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {/* ── Coupon ── */}
      <section className="section-block section-tight">
        <div className="section-head" style={{ marginBottom: '12px' }}>
          <div>
            <span className="section-kicker">Coupon</span>
          </div>
        </div>
        {couponApplied ? (
          <div className="coupon-applied-row">
            <Tag size={15} style={{ color: 'var(--accent)' }} />
            <span className="coupon-applied-label">
              <strong>{COUPON_CODE}</strong> applied — {Math.round(COUPON_DISCOUNT * 100)}% off
            </span>
            <button type="button" className="coupon-remove-btn" onClick={handleRemoveCoupon}>
              Remove
            </button>
          </div>
        ) : (
          <div className="coupon-row">
            <input
              className="coupon-input"
              type="text"
              placeholder="Enter coupon code"
              value={couponInput}
              onChange={(e) => { setCouponInput(e.target.value); setCouponError('') }}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
            />
            <button type="button" className="secondary-button" onClick={handleApplyCoupon}>
              Apply
            </button>
          </div>
        )}
        {couponError && <p className="form-error" style={{ marginTop: '8px' }}>{couponError}</p>}
        {!couponApplied && (
          <p className="coupon-hint">
            <Tag size={12} /> Use code <strong>TIARA10</strong> for 10% off
          </p>
        )}
      </section>

      {/* ── Wallet ── */}
      <section className="section-block section-tight">
        <div className="wallet-apply-row">
          <div className="wallet-apply-info">
            <Wallet size={18} style={{ color: 'var(--accent)' }} />
            <div>
              <strong>Tiara Wallet</strong>
              <p style={{ margin: 0 }}>Balance: {formatCurrency(walletBalance)}</p>
            </div>
          </div>
          <label className="wallet-toggle-label">
            <input
              type="checkbox"
              checked={walletApplied}
              onChange={(e) => setWalletApplied(e.target.checked)}
              disabled={walletBalance === 0}
            />
            <span className="wallet-toggle-text">
              {walletApplied
                ? `Using ${formatCurrency(walletDeduction)}`
                : walletBalance === 0
                  ? 'No balance'
                  : 'Apply'}
            </span>
          </label>
        </div>
        {walletApplied && walletDeduction > 0 && (
          <p className="wallet-applied-note">
            {formatCurrency(walletDeduction)} will be deducted from your wallet at checkout.
            {paidFullyByWallet && ' No additional payment needed.'}
          </p>
        )}
      </section>

      {/* ── Delivery address ── */}
      <section className="section-block section-tight">
        <div className="section-head" style={{ marginBottom: '12px' }}>
          <span className="section-kicker">Deliver to</span>
        </div>
        <div className="address-options">
          {addresses.map((addr) => (
            <label key={addr} className={`address-option${selectedAddress === addr ? ' selected' : ''}`}>
              <input
                type="radio"
                name="address"
                value={addr}
                checked={selectedAddress === addr}
                onChange={() => setSelectedAddress(addr)}
              />
              {addr}
            </label>
          ))}
        </div>
      </section>

      {/* ── Order summary ── */}
      <section className="section-block section-tight">
        <div className="section-head" style={{ marginBottom: '12px' }}>
          <span className="section-kicker">Order summary</span>
        </div>
        <div className="summary-card">
          <div><span>Subtotal ({enrichedItems.length} items)</span><strong>{formatCurrency(subtotal)}</strong></div>
          {couponApplied && (
            <div style={{ color: 'var(--accent)' }}>
              <span>Coupon ({COUPON_CODE})</span><strong>- {formatCurrency(couponDiscount)}</strong>
            </div>
          )}
          <div><span>GST (5%)</span><strong>{formatCurrency(tax)}</strong></div>
          <div><span>Platform fee (2%)</span><strong>{formatCurrency(serviceCharge)}</strong></div>
          {walletApplied && walletDeduction > 0 && (
            <div style={{ color: 'var(--accent)' }}>
              <span>Wallet credit</span><strong>- {formatCurrency(walletDeduction)}</strong>
            </div>
          )}
          <div className="summary-total">
            <span>{paidFullyByWallet ? 'Amount due (paid by wallet)' : 'Amount due'}</span>
            <strong style={{ fontSize: '1.2rem' }}>{formatCurrency(amountDue)}</strong>
          </div>

          {!paidFullyByWallet && amountDue > 0 && (
            <p className="payment-mode-note">
              Remaining {formatCurrency(amountDue)} via UPI / Card at confirmation
            </p>
          )}

          <button
            type="button"
            className="primary-button full"
            onClick={handlePlaceOrder}
            disabled={placing || placeOrder.isPending}
          >
            {placing || placeOrder.isPending
              ? 'Placing order…'
              : paidFullyByWallet
                ? `Pay with wallet — ${formatCurrency(0)} due`
                : `Place order — ${formatCurrency(amountDue)}`}
          </button>
        </div>
      </section>

    </div>
  )
}
