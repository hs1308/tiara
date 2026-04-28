import { MessageCircle, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatCurrency } from '../../lib/format'
import type { Product } from '../../types'

interface ProductCardProps {
  product: Product
  onAddToCart?: (productId: string) => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)

  return (
    <article className="product-card">
      <Link to={`/product/${product.id}`} className="product-image-wrap">
        <img src={product.heroImage} alt={product.name} className="product-image" />
      </Link>
      <div className="product-copy">
        <div className="eyebrow">{product.brand}</div>
        <Link to={`/product/${product.id}`}>
          <h3 className="product-title">{product.name}</h3>
        </Link>
        <p className="product-description">{product.description}</p>
        <div className="price-row">
          <strong>{formatCurrency(product.price)}</strong>
          <span>{formatCurrency(product.originalPrice)}</span>
          <small>{discount}% off</small>
        </div>
        <div className="metric-row">
          <span>★ {product.rating}</span>
          <span>{product.discussionCount} discussing</span>
          <span>◈ {product.communityScore}/10</span>
        </div>
      </div>
      <div className="card-actions">
        <button type="button" className="secondary-button">
          <MessageCircle size={15} />
          Discuss
        </button>
        <button
          type="button"
          className="primary-button"
          onClick={() => onAddToCart?.(product.id)}
        >
          <ShoppingBag size={15} />
          Add
        </button>
      </div>
    </article>
  )
}
