import { MessageCircle, Search, ShoppingBag, ThumbsUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FaceScanModal } from '../components/ui/FaceScanModal'
import { PostCard } from '../components/ui/PostCard'
import { ProductCard } from '../components/ui/ProductCard'
import { useAddToCart, useCurrentUser, usePosts, useProducts, useUsers } from '../hooks/useTiaraData'
import { formatCurrency } from '../lib/format'
import type { Post, Product } from '../types'

const CONTEXTUAL_TOPIC = 'dark circles'
const CONTEXTUAL_TERMS = [
  'dark circle',
  'dark circles',
  'under eye',
  'under-eye',
  'caffeine',
  'pigmentation',
  'brightening',
]

function hasContextualMatch(values: Array<string | null | undefined>) {
  const haystack = values.filter(Boolean).join(' ').toLowerCase()
  return CONTEXTUAL_TERMS.some((term) => haystack.includes(term))
}

function getContextualProducts(products: Product[]) {
  const matched = products.filter((product) =>
    hasContextualMatch([
      product.name,
      product.brand,
      product.description,
      product.category,
      ...product.tags,
      ...product.suitability,
      ...product.ingredients,
    ]),
  )

  return (matched.length ? matched : [...products].sort((a, b) => b.discussionCount - a.discussionCount)).slice(0, 3)
}

function getContextualPosts(posts: Post[], contextualProducts: Product[]) {
  const contextualProductIds = new Set(contextualProducts.map((product) => product.id))
  const matched = posts.filter((post) =>
    contextualProductIds.has(post.productId ?? '') ||
    hasContextualMatch([post.title, post.description, post.type, post.brand, ...post.tags]),
  )

  return (matched.length ? matched : [...posts].sort((a, b) => b.commentCount - a.commentCount)).slice(0, 3)
}

function HeroProductRow({
  product,
  onAddToCart,
}: {
  product: Product
  onAddToCart: () => Promise<unknown>
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const [justAdded, setJustAdded] = useState(false)

  useEffect(() => {
    if (!justAdded) return
    const t = window.setTimeout(() => setJustAdded(false), 1400)
    return () => window.clearTimeout(t)
  }, [justAdded])

  return (
    <div className="hero-product-row">
      <Link to={`/product/${product.id}`} className="hero-product-thumb-wrap">
        <img src={product.heroImage} alt={product.name} className="hero-product-thumb" />
      </Link>
      <div className="hero-product-info">
        <span className="eyebrow">{product.brand}</span>
        <Link to={`/product/${product.id}`} className="hero-product-name">{product.name}</Link>
        <div className="hero-product-meta">
          <span>★ {product.rating}</span>
          <span>◈ {product.communityScore}/10</span>
          <span>{product.discussionCount} discussing</span>
        </div>
      </div>
      <div className="hero-product-aside">
        <span className="hero-product-price">{formatCurrency(product.price)}</span>
        <div className="hero-product-ctas">
          <button
            type="button"
            className="secondary-button hero-action-btn"
            title="Start discussion"
            onClick={() =>
              navigate(`/create?productId=${product.id}&type=Product%20Talk`, {
                state: { backgroundLocation: location },
              })
            }
          >
            <MessageCircle size={13} />
          </button>
          <button
            type="button"
            className="primary-button hero-action-btn"
            onClick={async () => {
              await onAddToCart()
              setJustAdded(true)
            }}
          >
            <ShoppingBag size={13} />
            {justAdded ? 'Added' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function HomePage() {
  const navigate = useNavigate()
  const [showFaceScan, setShowFaceScan] = useState(false)
  const { data: user } = useCurrentUser()
  const { data: users = [] } = useUsers()
  const { data: products = [] } = useProducts()
  const { data: posts = [] } = usePosts()
  const addToCart = useAddToCart()

  const contextualProducts = getContextualProducts(products)
  const contextualPosts = getContextualPosts(posts, contextualProducts)
  const contextualProductIds = new Set(contextualProducts.map((product) => product.id))
  const contextualPostIds = new Set(contextualPosts.map((post) => post.id))
  const featuredProducts = products.filter((product) => !contextualProductIds.has(product.id)).slice(0, 3)
  const livePosts = posts.filter((post) => !contextualPostIds.has(post.id)).slice(0, 3)

  return (
    <div className="page-stack">
      <section className="hero-panel contextual-hero">
        <div className="hero-copy">
          <h2 className="contextual-hero-heading">
            {user ? `Hi ${user.name.split(' ')[0]} · ` : ''}Based on your recent search{' '}
            <span className="topic-badge">
              <Search size={13} />
              {CONTEXTUAL_TOPIC}
            </span>
          </h2>
          <p>Here&apos;s what the community says — and the products that actually helped.</p>
        </div>

        <div className="contextual-columns">
          <div className="contextual-col">
            <div className="contextual-subhead">
              <span className="section-kicker">Products that helped</span>
              <Link to={`/shop?concern=${encodeURIComponent(CONTEXTUAL_TOPIC)}`} className="inline-link">See all</Link>
            </div>
            <div className="hero-product-list">
              {contextualProducts.map((product) => (
                <HeroProductRow
                  key={product.id}
                  product={product}
                  onAddToCart={() => addToCart.mutateAsync(product.id)}
                />
              ))}
            </div>
          </div>

          <div className="contextual-col">
            <div className="contextual-subhead">
              <span className="section-kicker">What people are saying</span>
              <Link to={`/feed?problem=${encodeURIComponent(CONTEXTUAL_TOPIC)}`} className="inline-link">See all</Link>
            </div>
            <div className="hero-post-list">
              {contextualPosts.map((post) => {
                const author = users.find((u) => u.id === post.authorId)
                return (
                  <Link key={post.id} to={`/feed/${post.id}`} className="hero-post-snippet">
                    <div className="hero-post-snippet-top">
                      <span className="tag-pill hero-type-pill">{post.type}</span>
                      <div className="hero-post-snippet-stats">
                        <ThumbsUp size={11} />
                        {post.upvotes}
                        <MessageCircle size={11} />
                        {post.commentCount}
                      </div>
                    </div>
                    <p className="hero-post-snippet-title">{post.title}</p>
                    <div className="hero-post-snippet-author">
                      <img src={author?.avatar} alt={author?.name} className="avatar-xs" />
                      <span>{author?.name}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="section-head">
          <div>
            <h2>The community is obsessing over</h2>
          </div>
          <Link to="/shop" className="inline-link">
            See all
          </Link>
        </div>
        <div className="product-grid">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={(productId) => addToCart.mutateAsync(productId)}
            />
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="section-head">
          <div>
            <h2>What the community is talking about</h2>
          </div>
          <Link to="/feed" className="inline-link">
            Go to feed
          </Link>
        </div>
        <div className="feed-stack">
          {livePosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              author={users.find((item) => item.id === post.authorId)}
              product={products.find((item) => item.id === post.productId)}
            />
          ))}
        </div>
      </section>

      <section className="section-block cta-band">
        <div>
          <span className="section-kicker">Complete your profile</span>
          <h2>Sharper skincare picks, better community context, stronger recommendations.</h2>
        </div>
        <button type="button" className="primary-button" onClick={() => setShowFaceScan(true)}>
          Analyse Face
        </button>
      </section>

      {showFaceScan && (
        <FaceScanModal
          onClose={() => setShowFaceScan(false)}
          onComplete={(_results) => {
            // Results are hardcoded in FaceScanModal — profile update is visual demo only
            setShowFaceScan(false)
            navigate('/profile')
          }}
        />
      )}
    </div>
  )
}
