import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { demoUserId } from '../data/mockData'
import { useCart, useCreateOrder, useCurrentUser, useProducts } from '../hooks/useTiaraData'
import { formatCurrency } from '../lib/format'
import { useDemoApp } from '../state/useDemoApp'

const addresses = ['Home · Bandra West', 'Work · BKC', 'Parents · Pune']
const paymentModes = ['UPI', 'Credit Card', 'Cash on Delivery']

export function CheckoutPage() {
  const navigate = useNavigate()
  const [addressLabel, setAddressLabel] = useState(addresses[0])
  const [paymentMode, setPaymentMode] = useState(paymentModes[0])
  const { data: cartItems = [] } = useCart()
  const { data: products = [] } = useProducts()
  const { data: user } = useCurrentUser()
  const createOrder = useCreateOrder()
  const { checkoutWalletApplied } = useDemoApp()

  const subtotal = cartItems.reduce((sum, item) => {
    const product = products.find((entry) => entry.id === item.productId)
    return sum + (product?.price ?? 0) * item.quantity
  }, 0)
  const total = Math.max(subtotal - checkoutWalletApplied, 0)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const order = await createOrder.mutateAsync({
      userId: demoUserId,
      items: cartItems.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      subtotal,
      walletApplied: checkoutWalletApplied,
      total,
      paymentMode,
      addressLabel,
    })
    navigate(`/success/${order.id}`)
  }

  return (
    <form className="page-stack" onSubmit={handleSubmit}>
      <section className="section-block section-tight">
        <div className="section-head">
          <div>
            <span className="section-kicker">Checkout</span>
            <h2>Dummy payment flow, real product story</h2>
          </div>
        </div>
        <div className="checkout-grid">
          <label className="field">
            <span>Deliver to</span>
            <select value={addressLabel} onChange={(event) => setAddressLabel(event.target.value)}>
              {addresses.map((address) => (
                <option key={address} value={address}>
                  {address}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Payment mode</span>
            <select value={paymentMode} onChange={(event) => setPaymentMode(event.target.value)}>
              {paymentModes.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>
      <section className="section-block section-tight">
        <div className="summary-card">
          <div>
            <span>Order subtotal</span>
            <strong>{formatCurrency(subtotal)}</strong>
          </div>
          <div>
            <span>Wallet applied</span>
            <strong>-{formatCurrency(checkoutWalletApplied)}</strong>
          </div>
          <div>
            <span>Payment</span>
            <strong>{paymentMode}</strong>
          </div>
          <div className="summary-total">
            <span>Pay now</span>
            <strong>{formatCurrency(total)}</strong>
          </div>
          <button type="submit" className="primary-button full">
            Place order for {user?.name.split(' ')[0]}
          </button>
        </div>
      </section>
    </form>
  )
}
