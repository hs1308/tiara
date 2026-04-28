import { useSearchParams } from 'react-router-dom'
import { FilterDropdown } from '../components/ui/FilterDropdown'
import { PostCard } from '../components/ui/PostCard'
import { usePosts, useProducts, useUsers } from '../hooks/useTiaraData'
import type { FeedSort } from '../types'

const SORT_OPTIONS: Array<{ value: FeedSort; label: string }> = [
  { value: 'New', label: 'New' },
  { value: 'Trending', label: 'Trending' },
  { value: 'Popular', label: 'Popular' },
]

const CARE_OPTIONS = [
  { value: 'Skincare', label: 'Skincare' },
  { value: 'Makeup', label: 'Makeup' },
  { value: 'Haircare', label: 'Haircare' },
  { value: 'Nailcare', label: 'Nailcare' },
  { value: 'Fragrance', label: 'Fragrance' },
  { value: 'Lip care', label: 'Lip care' },
]

const PRODUCT_TYPE_OPTIONS = [
  { value: 'sunscreen', label: 'Sunscreen' },
  { value: 'serum', label: 'Serum' },
  { value: 'moisturiser', label: 'Moisturiser' },
  { value: 'face mask', label: 'Face mask' },
  { value: 'foundation', label: 'Foundation' },
  { value: 'concealer', label: 'Concealer' },
  { value: 'toner', label: 'Toner' },
  { value: 'lip balm', label: 'Lip balm' },
  { value: 'hair mask', label: 'Hair mask' },
  { value: 'nail polish', label: 'Nail polish' },
  { value: 'perfume mist', label: 'Perfume mist' },
]

const PROBLEM_OPTIONS = [
  { value: 'acne', label: 'Acne' },
  { value: 'dark circles', label: 'Dark circles' },
  { value: 'pigmentation', label: 'Pigmentation' },
  { value: 'dry skin', label: 'Dry skin' },
  { value: 'oily skin', label: 'Oily skin' },
  { value: 'frizz', label: 'Frizz' },
  { value: 'sensitive skin', label: 'Sensitive skin' },
  { value: 'hair fall', label: 'Hair fall' },
  { value: 'texture', label: 'Texture' },
  { value: 'pores', label: 'Open pores' },
  { value: 'redness', label: 'Redness' },
]

const WEATHER_OPTIONS = [
  { value: 'humid', label: 'Humid / Monsoon' },
  { value: 'sunny', label: 'Sunny / Hot' },
  { value: 'cold', label: 'Cold / Dry' },
  { value: 'rainy', label: 'Rainy' },
]

function matchesSearch(haystack: string, needle: string) {
  return haystack.toLowerCase().includes(needle.toLowerCase())
}

export function FeedPage() {
  const [params, setParams] = useSearchParams()

  const sort = (params.get('sort') as FeedSort) || 'New'
  const care = params.get('care') || ''
  const productType = params.get('productType') || ''
  const productId = params.get('product') || ''
  const brand = params.get('brand') || ''
  const problem = params.get('problem') || ''
  const weather = params.get('weather') || ''

  const { data: posts = [] } = usePosts()
  const { data: users = [] } = useUsers()
  const { data: products = [] } = useProducts()

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  // Derive product name and brand options dynamically from data
  const productNameOptions = products.map((p) => ({ value: p.id, label: p.name }))
  const brandOptions = [...new Set(products.map((p) => p.brand))].map((b) => ({ value: b, label: b }))

  // Sort
  const sorted = [...posts].sort((a, b) => {
    if (sort === 'Popular') return b.upvotes - a.upvotes
    if (sort === 'Trending') return b.commentCount - a.commentCount
    return +new Date(b.createdAt) - +new Date(a.createdAt)
  })

  // Filter
  const filtered = sorted.filter((post) => {
    const product = products.find((p) => p.id === post.productId)
    const allText = [
      post.title, post.description, post.brand,
      ...(post.tags ?? []),
      product?.name, product?.category, product?.description,
      ...(product?.tags ?? []), ...(product?.suitability ?? []),
    ].filter(Boolean).join(' ')

    if (care && !matchesSearch(allText, care) && product?.category !== care) return false
    if (productType && !matchesSearch(allText, productType)) return false
    if (productId && post.productId !== productId) return false
    if (brand && post.brand !== brand && product?.brand !== brand) return false
    if (problem && !matchesSearch(allText, problem)) return false
    if (weather && !matchesSearch(allText, weather)) return false
    return true
  })

  const activeFilterCount = [care, productType, productId, brand, problem, weather].filter(Boolean).length

  return (
    <div className="page-stack">
      <section className="section-block section-tight feed-header-section">
        <h2 className="feed-page-title">Community Feed</h2>

        {/* Filter bar */}
        <div className="feed-filter-bar">
          {/* Sort — always visible, leftmost */}
          <FilterDropdown
            label="Sort"
            value={sort}
            options={SORT_OPTIONS}
            onChange={(v) => setParam('sort', v)}
            allLabel="New"
          />

          <div className="feed-filter-divider" />

          <FilterDropdown
            label="Category"
            value={care}
            options={CARE_OPTIONS}
            onChange={(v) => setParam('care', v)}
          />
          <FilterDropdown
            label="Product type"
            value={productType}
            options={PRODUCT_TYPE_OPTIONS}
            onChange={(v) => setParam('productType', v)}
          />
          <FilterDropdown
            label="Product"
            value={productId}
            options={productNameOptions}
            onChange={(v) => setParam('product', v)}
          />
          <FilterDropdown
            label="Brand"
            value={brand}
            options={brandOptions}
            onChange={(v) => setParam('brand', v)}
          />
          <FilterDropdown
            label="Concern"
            value={problem}
            options={PROBLEM_OPTIONS}
            onChange={(v) => setParam('problem', v)}
          />
          <FilterDropdown
            label="Weather"
            value={weather}
            options={WEATHER_OPTIONS}
            onChange={(v) => setParam('weather', v)}
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

        {/* Active filter summary */}
        {activeFilterCount > 0 && (
          <p className="feed-filter-summary">
            {filtered.length} post{filtered.length !== 1 ? 's' : ''} matching your filters
          </p>
        )}
      </section>

      <div className="feed-stack">
        {filtered.length > 0 ? (
          filtered.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              author={users.find((u) => u.id === post.authorId)}
              product={products.find((p) => p.id === post.productId)}
            />
          ))
        ) : (
          <div className="empty-state">
            No posts match these filters yet.{' '}
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
