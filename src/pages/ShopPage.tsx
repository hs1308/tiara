import { useNavigate, useSearchParams } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { FilterDropdown } from '../components/ui/FilterDropdown'
import { useAddToCart, useBrands, useProducts } from '../hooks/useTiaraData'
import { brandSlug } from '../lib/utils'

// ── Filter / sort options ─────────────────────────────────────────

const SORT_OPTIONS = [
  { value: 'popular',   label: 'Most popular' },
  { value: 'community', label: 'Highest community score' },
  { value: 'discussed', label: 'Most discussed' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc',label: 'Price: High to Low' },
]

const CATEGORY_OPTIONS = [
  { value: 'Skincare',  label: 'Skincare' },
  { value: 'Makeup',    label: 'Makeup' },
  { value: 'Haircare',  label: 'Haircare' },
  { value: 'Nailcare',  label: 'Nailcare' },
  { value: 'Fragrance', label: 'Fragrance' },
  { value: 'Lip care',  label: 'Lip care' },
]

const CONCERN_OPTIONS = [
  { value: 'acne',        label: 'Acne' },
  { value: 'pigmentation',label: 'Pigmentation' },
  { value: 'dark circles',label: 'Dark circles' },
  { value: 'dry skin',    label: 'Dry skin' },
  { value: 'oily skin',   label: 'Oily skin' },
  { value: 'sensitive',   label: 'Sensitive skin' },
  { value: 'frizz',       label: 'Frizz' },
  { value: 'hair fall',   label: 'Hair fall' },
]

const INGREDIENT_OPTIONS = [
  { value: 'niacinamide',      label: 'Niacinamide' },
  { value: 'vitamin c',        label: 'Vitamin C' },
  { value: 'retinol',          label: 'Retinol' },
  { value: 'hyaluronic acid',  label: 'Hyaluronic acid' },
  { value: 'salicylic acid',   label: 'Salicylic acid' },
  { value: 'ceramides',        label: 'Ceramides' },
  { value: 'glycerin',         label: 'Glycerin' },
  { value: 'squalane',         label: 'Squalane' },
  { value: 'peptides',         label: 'Peptides' },
  { value: 'caffeine',         label: 'Caffeine' },
  { value: 'kojic acid',       label: 'Kojic acid' },
  { value: 'zinc oxide',       label: 'Zinc oxide' },
  { value: 'shea butter',      label: 'Shea butter' },
  { value: 'aha',              label: 'AHA' },
  { value: 'bha',              label: 'BHA' },
]

// ── Sentiment score helper (derived from communityScore) ──────────
// communityScore is out of 10; convert to a sentiment % with some
// variation so cards don't all look identical

function sentimentFromScore(score: number, id: string): number {
  // deterministic jitter based on product id so it's stable across renders
  const jitter = (id.charCodeAt(id.length - 1) % 10) - 5
  return Math.min(99, Math.max(50, Math.round(score * 9.5 + jitter)))
}

function sentimentColour(pct: number): string {
  if (pct >= 80) return 'var(--accent)'
  if (pct >= 65) return '#c48d3a'
  return '#ad4f48'
}

// ── Brand sentiment (average of products in that brand) ───────────
function brandSentiment(brandName: string, products: ReturnType<typeof useProducts>['data']): number {
  if (!products) return 72
  const branded = products.filter((p) => p.brand === brandName)
  if (!branded.length) return 72
  const avg = branded.reduce((s, p) => s + p.communityScore, 0) / branded.length
  return sentimentFromScore(avg, brandName)
}

// ── Brand initials avatar ─────────────────────────────────────────
function BrandAvatar({ name, logo }: { name: string; logo: string | null }) {
  if (logo) {
    return <img src={logo} alt={name} className="discover-brand-logo" />
  }
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  return <div className="discover-brand-initials">{initials}</div>
}

// ── Main page ─────────────────────────────────────────────────────

export function ShopPage() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const { data: products = [] } = useProducts()
  const { data: brands = [] } = useBrands()
  const addToCart = useAddToCart()

  const category   = params.get('category')   || ''
  const brand      = params.get('brand')       || ''
  const concern    = params.get('concern')     || ''
  const ingredient = params.get('ingredient') || ''
  const sort       = params.get('sort')        || 'popular'

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  const brandOptions = [...new Set(products.map((p) => p.brand))].map((b) => ({ value: b, label: b }))

  // ── Filter ──────────────────────────────────────────────────────
  const filtered = products
    .filter((p) => {
      if (category && p.category !== category) return false
      if (brand && p.brand !== brand) return false
      if (concern) {
        const haystack = [p.name, p.description, p.category, ...p.tags, ...p.suitability].join(' ').toLowerCase()
        if (!haystack.includes(concern.toLowerCase())) return false
      }
      if (ingredient) {
        const ingredientHaystack = [
          ...p.ingredients,
          p.name, p.description,
          ...p.tags,
        ].join(' ').toLowerCase()
        if (!ingredientHaystack.includes(ingredient.toLowerCase())) return false
      }
      return true
    })
    .sort((a, b) => {
      if (sort === 'community')  return b.communityScore - a.communityScore
      if (sort === 'discussed')  return b.discussionCount - a.discussionCount
      if (sort === 'price_asc')  return a.price - b.price
      if (sort === 'price_desc') return b.price - a.price
      return b.rating - a.rating
    })

  const activeFilterCount = [category, brand, concern, ingredient].filter(Boolean).length

  return (
    <div className="page-stack">

      {/* ── Brands carousel ────────────────────────────────────── */}
      <section className="section-block discover-brands-section">
        <div className="section-head">
          <div>
            <span className="section-kicker">Browse by brand</span>
            <h2>Popular brands</h2>
          </div>
        </div>

        <div className="discover-brands-rail">
          {brands.map((b) => {
            const pct = brandSentiment(b.name, products)
            const colour = sentimentColour(pct)
            const isActive = brand === b.name
            return (
              <button
                key={b.id}
                type="button"
                className={`discover-brand-card${isActive ? ' discover-brand-card--active' : ''}`}
                onClick={() => setParam('brand', isActive ? '' : b.name)}
              >
                <BrandAvatar name={b.name} logo={b.logo} />
                <span className="discover-brand-name">{b.name}</span>
                <span className="discover-brand-sentiment" style={{ color: colour }}>
                  {pct}% community
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {/* ── Products ───────────────────────────────────────────── */}
      <section className="section-block section-tight feed-header-section">
        <div className="section-head" style={{ marginBottom: 0 }}>
          <h2 className="feed-page-title">Popular products</h2>
        </div>

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
          <FilterDropdown
            label="Ingredient"
            value={ingredient}
            options={INGREDIENT_OPTIONS}
            onChange={(v) => setParam('ingredient', v)}
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

      {/* ── Product grid ───────────────────────────────────────── */}
      {filtered.length > 0 ? (
        <div className="discover-product-grid">
          {filtered.map((product) => {
            const pct = sentimentFromScore(product.communityScore, product.id)
            const colour = sentimentColour(pct)
            const ingredients = Array.isArray(product.ingredients) ? product.ingredients : []

            return (
              <article key={product.id} className="discover-product-card">
                {/* Image */}
                <Link to={`/product/${product.id}`} className="discover-product-image-wrap">
                  <img
                    src={product.heroImage}
                    alt={product.name}
                    className="discover-product-image"
                  />
                  {product.newLaunch && (
                    <span className="discover-product-new-badge">New</span>
                  )}
                </Link>

                {/* Body */}
                <div className="discover-product-body">
                  <button
                    type="button"
                    className="discover-product-brand"
                    onClick={() => navigate(`/brand/${brandSlug(product.brand)}`)}
                  >
                    {product.brand}
                  </button>

                  <Link to={`/product/${product.id}`}>
                    <h3 className="discover-product-name">{product.name}</h3>
                  </Link>

                  <p className="discover-product-desc">{product.description}</p>

                  {ingredients.length > 0 && (
                    <p className="discover-product-ingredients">
                      {ingredients.slice(0, 3).join(' · ')}
                    </p>
                  )}

                  {/* Sentiment */}
                  <div className="discover-product-sentiment">
                    <div className="discover-sentiment-bar-track">
                      <div
                        className="discover-sentiment-bar-fill"
                        style={{ width: `${pct}%`, background: colour }}
                      />
                    </div>
                    <span className="discover-sentiment-label" style={{ color: colour }}>
                      {pct}% positive
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="discover-product-actions">
                    <button
                      type="button"
                      className="secondary-button discover-action-btn"
                      onClick={() => navigate(`/feed?product=${product.id}`)}
                    >
                      <MessageCircle size={14} />
                      {product.discussionCount} discussions
                    </button>
                    <button
                      type="button"
                      className="primary-button discover-action-btn"
                      onClick={() => addToCart.mutateAsync(product.id)}
                    >
                      Add to cart
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="empty-state">
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
  )
}
