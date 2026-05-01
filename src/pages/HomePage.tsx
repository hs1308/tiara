import { MessageCircle, Search, ThumbsUp } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaceScanModal } from '../components/ui/FaceScanModal'
import { PostCard } from '../components/ui/PostCard'
import { ProductCard } from '../components/ui/ProductCard'
import { useAddToCart, useCurrentUser, usePosts, useProducts, useUsers } from '../hooks/useTiaraData'
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

function getContextualPosts(posts: Post[], products: Product[]) {
  const matched = posts.filter((post) => {
    const product = products.find((p) => p.id === post.productId)
    return hasContextualMatch([
      post.title,
      post.description,
      post.brand,
      ...(Array.isArray(post.tags) ? post.tags : []),
      product?.name,
      product?.description,
      ...(Array.isArray(product?.tags) ? product!.tags : []),
      ...(Array.isArray(product?.suitability) ? product!.suitability : []),
    ])
  })
  return (matched.length ? matched : [...posts].sort((a, b) => b.upvotes - a.upvotes)).slice(0, 4)
}

export function HomePage() {
  const navigate = useNavigate()
  const [showFaceScan, setShowFaceScan] = useState(false)
  const { data: user } = useCurrentUser()
  const { data: users = [] } = useUsers()
  const { data: products = [] } = useProducts()
  const { data: posts = [] } = usePosts()
  const addToCart = useAddToCart()

  const contextualPosts = getContextualPosts(posts, products)
  const contextualPostIds = new Set(contextualPosts.map((post) => post.id))
  const featuredProducts = products.filter((p) => !contextualPostIds.has(p.id)).slice(0, 3)
  const livePosts = posts.filter((post) => !contextualPostIds.has(post.id)).slice(0, 3)
  const firstName = user?.name?.split(' ')[0] ?? 'there'
  void firstName // used in future modules

  return (
    <div className="page-stack">

      {/* ── Module 1: Based on your recent search ── */}
      {contextualPosts.length > 0 && (
        <section className="section-block recent-search-module">
          <div className="recent-search-header">
            <div className="recent-search-meta">
              <span className="section-kicker">Based on your recent search</span>
              <span className="topic-badge">
                <Search size={12} />
                {CONTEXTUAL_TOPIC}
              </span>
            </div>
            <Link
              to={`/feed?problem=${encodeURIComponent(CONTEXTUAL_TOPIC)}`}
              className="inline-link"
            >
              See all discussions
            </Link>
          </div>

          <div className="recent-search-posts">
            {contextualPosts.map((post) => {
              const author = users.find((u) => u.id === post.authorId)
              return (
                <Link
                  key={post.id}
                  to={`/feed/${post.id}`}
                  className="search-post-card"
                >
                  <div className="search-post-top">
                    <span className="tag-pill">{post.type}</span>
                    <div className="search-post-stats">
                      <ThumbsUp size={12} />
                      <span>{post.upvotes}</span>
                      <MessageCircle size={12} />
                      <span>{post.commentCount}</span>
                    </div>
                  </div>
                  <p className="search-post-title">{post.title}</p>
                  <div className="search-post-author">
                    <img src={author?.avatar} alt={author?.name} className="avatar-xs" />
                    <span>{author?.name}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

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
