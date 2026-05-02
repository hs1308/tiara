import { useNavigate, useSearchParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { FilterDropdown } from '../components/ui/FilterDropdown'
import { useAddToCart, useBrands, useProducts } from '../hooks/useTiaraData'
import { brandSlug } from '../lib/utils'

const SORT_OPTIONS = [
  { value: 'popular',    label: 'Most popular' },
  { value: 'community',  label: 'Highest community score' },
  { value: 'discussed',  label: 'Most discussed' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
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
  { value: 'acne',         label: 'Acne' },
  { value: 'pigmentation', label: 'Pigmentation' },
  { value: 'dark circles', label: 'Dark circles' },
  { value: 'dry skin',     label: 'Dry skin' },
  { value: 'oily skin',    label: 'Oily skin' },
  { value: 'sensitive',    label: 'Sensitive skin' },
  { value: 'frizz',        label: 'Frizz' },
  { value: 'hair fall',    label: 'Hair fall' },
]

const INGREDIENT_OPTIONS = [
  { value: 'niacinamide',     label: 'Niacinamide' },
  { value: 'vitamin c',       label: 'Vitamin C' },
  { value: 'retinol',         label: 'Retinol' },
  { value: 'hyaluronic acid', label: 'Hyaluronic acid' },
  { value: 'salicylic acid',  label: 'Salicylic acid' },
  { value: 'ceramides',       label: 'Ceramides' },
  { value: 'glycerin',        label: 'Glycerin' },
  { value: 'squalane',        label: 'Squalane' },
  { value: 'peptides',        label: 'Peptides' },
  { value: 'caffeine',        label: 'Caffeine' },
  { value: 'kojic acid',      label: 'Kojic acid' },
  { value: 'zinc oxide',      label: 'Zinc oxide' },
  { value: 'shea butter',     label: 'Shea butter' },
  { value: 'aha',             label: 'AHA' },
  { value: 'bha',             label: 'BHA' },
]

const BRAND_SUMMARIES: Record<string, string> = {
  'Dot & Key':      'Community loves how well it holds up in humid Indian summers. Occasional gripe that it feels lightweight for very dry skin.',
  'Kay Beauty':     'Consistently praised for the best shade range for South Asian skin. Community favourite for concealer and lip liners.',
  'Minimalist':     'Highly trusted for transparent ingredient labels and honest concentrations. Community recommends the serums, less so the cleansers.',
  'The Ordinary':   'Great value for actives. Community finds the range overwhelming but individual products are reliable once you know what to get.',
  'Anomaly':        'Loved for curly and wavy Indian hair. Community notes visible bond-repair results, but wants more haircare variety from the brand.',
  'Sol de Janeiro': "Known as a compliment magnet. Community thinks it's pricey for a body mist but says the scent is worth every rupee.",
  'Pilgrim':        'Appreciated for Indian skin-specific formulations. Community says results are real but slower than premium alternatives.',
  'Plum':           'Beloved for cruelty-free, affordable basics. Community recommends for beginners but wants stronger actives from the brand.',
}

const PRODUCT_BULLETS: Record<string, [string, string, string]> = {
  'product-dot-key-sunscreen': [
    "Doesn't pill over moisturiser -- passes the Mumbai auto ride test",
    'No white cast, dries matte, works well for oily and combination skin',
    'Reapplication over makeup can be tricky without a setting spray',
  ],
  'product-kay-beauty-concealer': [
    'Best peach undertone for South Asian skin without a separate colour corrector',
    'Buildable coverage that holds up 8 hours in humid and hot weather',
    'Loved by MUAs for bridal and editorial looks on deeper skin tones',
  ],
  'product-minimalist-serum': [
    'Visibly fades acne marks and pigmentation in 6-8 weeks of consistent use',
    "Community's top pick for oily skin -- controls shine and tightens pores",
    "May cause a purge in the first 2 weeks -- push through, it's worth it",
  ],
  'product-ordinary-lip-balm': [
    'One of few balms that actually repairs chronically dry lips vs just coating',
    'Works as a matte lip base -- apply, blot, then apply lipstick on top',
    'Lightly scented, no flavour, unisex -- great for everyday use',
  ],
  'product-anomaly-mask': [
    'Noticeably reduces frizz in wavy and curly Indian hair after hard water days',
    'Best used as a pre-shampoo treatment -- penetrates better on dry or damp hair',
    'Community pairs it with an oil pre-treatment for maximum bond repair',
  ],
  'product-sdj-mist': [
    'Gets the most unsolicited compliments of any fragrance in the community',
    'Lasts 3-4 hours in humid heat -- layer over the matching lotion for longer wear',
    "Community agrees it's pricey but calls it the most giftable beauty item",
  ],
  'product-ordinary-caffeine': [
    'Reduces under-eye puffiness noticeably within 2 weeks for most users',
    'Not a miracle for deep melanin-driven dark circles -- better for puffiness',
    'Excellent lightweight texture that layers cleanly under SPF',
  ],
  'product-pilgrim-eye-serum': [
    'Kojic acid + Vitamin C combo specifically targets melanin pigmentation',
    'Community recommends for South Asian skin tones with brown-type dark circles',
    'Needs 8+ weeks to show results -- consistency is key',
  ],
  'product-plum-eye-gel': [
    'Loved for being lightweight and non-greasy under makeup',
    'Community says it visibly reduces puffiness, less convincing for dark circles',
    'Great value entry point for under-eye care for all skin types',
  ],
}

function sentimentFromScore(score: number, id: string): number {
  const jitter = (id.charCodeAt(id.length - 1) % 10) - 5
  return Math.min(99, Math.max(50, Math.round(score * 9.5 + jitter)))
}

function sentimentColour(pct: number): string {
  if (pct >= 80) return 'var(--accent)'
  if (pct >= 65) return '#c48d3a'
  return '#ad4f48'
}

function brandSentiment(brandName: string, products: { brand: string; communityScore: number }[]): number {
  const branded = products.filter((p) => p.brand === brandName)
  if (!branded.length) return 72
  const avg = branded.reduce((s, p) => s + p.communityScore, 0) / branded.length
  return sentimentFromScore(avg, brandName)
}

const BRAND_LOGOS: Record<string, string> = {
  'Dot & Key':      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=80&q=80',
  'Kay Beauty':     'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=80&q=80',
  'Minimalist':     'https://images.unsplash.com/photo-1626784215021-2e39ccf971cd?auto=format&fit=crop&w=80&q=80',
  'The Ordinary':   'https://images.unsplash.com/photo-1556228578-dd6c7935df10?auto=format&fit=crop&w=80&q=80',
  'Anomaly':        'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=80&q=80',
  'Sol de Janeiro': 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=80&q=80',
  'Pilgrim':        'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&w=80&q=80',
  'Plum':           'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=80&q=80',
}

function BrandAvatar({ name }: { name: string }) {
  const logo = BRAND_LOGOS[name]
  if (logo) return <img src={logo} alt={name} className="discover-brand-logo" />
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
  return <div className="discover-brand-initials">{initials}</div>
}

export function ShopPage() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const { data: products = [] } = useProducts()
  const { data: brands = [] } = useBrands()
  useAddToCart() // keep hook alive for future cart actions

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

  const filtered = products
    .filter((p) => {
      if (category && p.category !== category) return false
      if (brand && p.brand !== brand) return false
      if (concern) {
        const haystack = [p.name, p.description, p.category, ...p.tags, ...p.suitability].join(' ').toLowerCase()
        if (!haystack.includes(concern.toLowerCase())) return false
      }
      if (ingredient) {
        const haystack = [...p.ingredients, p.name, p.description, ...p.tags].join(' ').toLowerCase()
        if (!haystack.includes(ingredient.toLowerCase())) return false
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

      {/* Brand carousel */}
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
            const summary = BRAND_SUMMARIES[b.name] ?? "Community is actively discussing this brand's products."
            return (
              <Link
                key={b.id}
                to={`/brand/${brandSlug(b.name)}`}
                className={`discover-brand-card${isActive ? ' discover-brand-card--active' : ''}`}
              >
                <BrandAvatar name={b.name} />
                <span className="discover-brand-name">{b.name}</span>
                <span className="discover-brand-sentiment" style={{ color: colour }}>
                  {pct}% positive
                </span>
                <p className="discover-brand-summary">{summary}</p>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Filters */}
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
          <FilterDropdown label="Category"   value={category}   options={CATEGORY_OPTIONS}   onChange={(v) => setParam('category', v)} />
          <FilterDropdown label="Brand"      value={brand}      options={brandOptions}        onChange={(v) => setParam('brand', v)} />
          <FilterDropdown label="Concern"    value={concern}    options={CONCERN_OPTIONS}     onChange={(v) => setParam('concern', v)} />
          <FilterDropdown label="Ingredient" value={ingredient} options={INGREDIENT_OPTIONS}  onChange={(v) => setParam('ingredient', v)} />
          {activeFilterCount > 0 && (
            <button type="button" className="feed-clear-filters" onClick={() => setParams({ sort }, { replace: true })}>
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

      {/* Product grid */}
      {filtered.length > 0 ? (
        <div className="discover-product-grid">
          {filtered.map((product) => {
            const pct = sentimentFromScore(product.communityScore, product.id)
            const colour = sentimentColour(pct)
            const ingredients = Array.isArray(product.ingredients) ? product.ingredients : []
            const bullets: [string, string, string] = PRODUCT_BULLETS[product.id] ?? [
              `Rated ${product.rating}/5 by the community`,
              `${product.discussionCount} active discussions on Tiara`,
              `Community score: ${product.communityScore}/10`,
            ]
            return (
              <article key={product.id} className="discover-product-card">
                <Link to={`/product/${product.id}`} className="discover-product-image-wrap">
                  <img src={product.heroImage} alt={product.name} className="discover-product-image" />
                  {product.newLaunch && <span className="discover-product-new-badge">New</span>}
                </Link>
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
                  <div className="discover-product-sentiment">
                    <div className="discover-sentiment-bar-track">
                      <div className="discover-sentiment-bar-fill" style={{ width: `${pct}%`, background: colour }} />
                    </div>
                    <span className="discover-sentiment-label" style={{ color: colour }}>{pct}% positive</span>
                  </div>
                  <ul className="discover-community-bullets">
                    {bullets.map((bullet, i) => <li key={i}>{bullet}</li>)}
                  </ul>
                  <Link to={`/feed?product=${product.id}`} className="discover-see-discussions">
                    See community discussions &rarr;
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="empty-state">
          No products match these filters.{' '}
          <button type="button" className="inline-link" onClick={() => setParams({ sort }, { replace: true })}>
            Clear filters
          </button>
        </div>
      )}
    </div>
  )
}
