import { useState } from 'react'
import { Chip } from '../components/ui/Chip'
import { ProductCard } from '../components/ui/ProductCard'
import { useAddToCart, useProducts } from '../hooks/useTiaraData'
import type { InterestCategory } from '../types'

const categories: Array<'All' | InterestCategory> = [
  'All',
  'Skincare',
  'Makeup',
  'Haircare',
  'Nailcare',
  'Fragrance',
  'Lip care',
]

export function ShopPage() {
  const [category, setCategory] = useState<'All' | InterestCategory>('All')
  const { data: products = [] } = useProducts()
  const addToCart = useAddToCart()

  const filtered =
    category === 'All' ? products : products.filter((product) => product.category === category)

  return (
    <div className="page-stack">
      <section className="section-block section-tight">
        <div className="section-head">
          <div>
            <span className="section-kicker">Shop</span>
            <h2>Inventory-led beauty with community context on every card</h2>
          </div>
        </div>
        <div className="control-strip">
          {categories.map((option) => (
            <Chip key={option} active={option === category} onClick={() => setCategory(option)}>
              {option}
            </Chip>
          ))}
        </div>
      </section>
      <div className="product-grid">
        {filtered.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={(productId) => addToCart.mutateAsync(productId)}
          />
        ))}
      </div>
    </div>
  )
}
