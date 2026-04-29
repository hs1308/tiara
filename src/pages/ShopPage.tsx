import { useSearchParams } from 'react-router-dom'
import { FilterDropdown } from '../components/ui/FilterDropdown'
import { ProductCard } from '../components/ui/ProductCard'
import { useAddToCart, useProducts } from '../hooks/useTiaraData'

const CATEGORY_OPTIONS = [
  { value: 'Skincare', label: 'Skincare' },
  { value: 'Makeup', label: 'Makeup' },
  { value: 'Haircare', label: 'Haircare' },
  { value: 'Nailcare', label: 'Nailcare' },
  { value: 'Fragrance', label: 'Fragrance' },
  { value: 'Lip care', label: 'Lip care' },
]

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most popular' },
  { value: 'community', label: 'Highest community score' },
  { value: 'discussed', label: 'Most discussed' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
]

const CONCERN_OPTIONS = [
  { value: 'acne', label: 'Acne' },
  { value: 'pigmentation', label: 'Pigmentation' },
  { value: 'dark circles', label: 'Dark circles' },
  { value: 'dry skin', label: 'Dry skin' },
  { value: 'oily skin', label: 'Oily skin' },
  { value: 'sensitive', label: 'Sensitive skin' },
  { value: 'frizz', label: 'Frizz' },
  { value: 'hair fall', label: 'Hair fall' },
]

export function ShopPage() {
  const [params, setParams] = useSearchParams()
  const { data: products = [] } = useProducts()
  const addToCart = useAddToCart()

  const category = params.get('category') || ''
  const brand = params.get('brand') || ''
  const concern = params.get('concern') || ''
  const sort = params.get('sort') || 'popular'

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  const brandOptions = [...new Set(products.map((p) => p.brand))].map((b) => ({ value: b, label: b }))

  const filtered = products
    .filter((p) => {
      if (category && p.category !== category) return false
      if (brand && p.brand !== brand) return false
      if (concern) {
        const haystack = [p.name, p.description, p.category, ...p.tags, ...p.suitability].join(' ').toLowerCase()
        if (!haystack.includes(concern.toLowerCase())) return false
      }
      return true
    })
    .sort((a, b) => {
      if (sort === 'community') return b.communityScore - a.communityScore
      if (sort === 'discussed') return b.discussionCount - a.discussionCount
      if (sort === 'price_asc') return a.price - b.price
      if (sort === 'price_desc') return b.price - a.price
      return b.rating - a.rating // popular default
    })

  const activeFilterCount = [category, brand, concern].filter(Boolean).length

  return (
    <div className="page-stack">
      <section className="section-block section-tight feed-header-section">
        <h2 className="feed-page-title">Shop</h2>

        <div className="feed-filter-bar">
          <FilterDropdown
            label="Sort"
            value={sort}
            options={SORT_OPTIONS}
            onChange={(v) => setParam('sort', v)}
            allLabel="Most popular"
          />
          <div className="feed-filter-divider" />
          <FilterDropdown
            label="Category"
            value={category}
            options={CATEGORY_OPTIONS}
            onChange={(v) => setParam('category', v)}
          />
          <FilterDropdown
            label="Brand"
            value={brand}
            options={brandOptions}
            onChange={(v) => setParam('brand', v)}
          />
          <FilterDropdown
            label="Concern"
            value={concern}
            options={CONCERN_OPTIONS}
            onChange={(v) => setParam('concern', v)}
          />
          {activeFilterCount > 0 && (
            <button
              type="button"
              className="feed-clear-filters"
              onClick={() => setParams({ sort }, { replace: true })}
            >
              Clear {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''}
            </button>
          )}
        </div>

        {activeFilterCount > 0 && (
          <p className="feed-filter-summary">
            {filtered.length} product{filtered.length !== 1 ? 's' : ''} matching your filters
          </p>
        )}
      </section>

      <div className="product-grid">
        {filtered.length > 0 ? (
          filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={(productId) => addToCart.mutateAsync(productId)}
            />
          ))
        ) : (
          <div className="empty-state" style={{ gridColumn: '1/-1' }}>
            No products match these filters.{' '}
            <button
              type="button"
              className="inline-link"
              onClick={() => setParams({ sort }, { replace: true })}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
