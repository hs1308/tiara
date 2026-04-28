import { ArrowRight, MessageCircle, Share2 } from 'lucide-react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { PostCard } from '../components/ui/PostCard'
import { usePosts, useProducts, useUsers } from '../hooks/useTiaraData'
import { formatCurrency } from '../lib/format'
import { brandSlug as toBrandSlug } from '../lib/utils'

export function BrandPage() {
  const { brandSlug = '' } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const brandParam = decodeURIComponent(brandSlug)

  const { data: allProducts = [] } = useProducts()
  const { data: posts = [] } = usePosts()
  const { data: users = [] } = useUsers()

  const resolvedBrandName =
    allProducts.find((product) => product.brand === brandParam || toBrandSlug(product.brand) === brandParam)?.brand ??
    brandParam
  const brandProducts = allProducts.filter((p) => p.brand === resolvedBrandName)

  if (brandProducts.length === 0) {
    return <div className="empty-state">We could not find that brand.</div>
  }

  const brandPosts = posts.filter((p) => p.brand === resolvedBrandName || brandProducts.some((bp) => bp.id === p.productId))
  const topPosts = [...brandPosts].sort((a, b) => b.upvotes - a.upvotes).slice(0, 3)

  const totalDiscussions = brandProducts.reduce((sum, p) => sum + p.discussionCount, 0)
  const avgCommunityScore = (
    brandProducts.reduce((sum, p) => sum + p.communityScore, 0) / brandProducts.length
  ).toFixed(1)

  const coverImage = brandProducts[0].heroImage

  return (
    <div className="page-stack">
      <section className="brand-hero">
        <div className="brand-cover" style={{ backgroundImage: `url(${coverImage})` }} />
        <div className="brand-hero-body">
          <div className="brand-identity">
            <img src={coverImage} alt={resolvedBrandName} className="brand-logo" />
            <div>
              <h1 className="brand-name">{resolvedBrandName}</h1>
              <p className="brand-tagline">Official brand page on Tiara</p>
            </div>
          </div>
          <div className="brand-stats">
            <div className="brand-stat">
              <strong>{brandProducts.length}</strong>
              <span>Products on Tiara</span>
            </div>
            <div className="brand-stat">
              <strong>{totalDiscussions}</strong>
              <span>Community discussions</span>
            </div>
            <div className="brand-stat">
              <strong>◈ {avgCommunityScore}/10</strong>
              <span>Community score</span>
            </div>
          </div>
          <div className="card-actions split">
            <button
              type="button"
              className="primary-button"
              onClick={() =>
                navigate(`/create?type=Product%20Talk`, {
                  state: { backgroundLocation: location },
                })
              }
            >
              <MessageCircle size={15} />
              Start a conversation
            </button>
            <button type="button" className="secondary-button">
              <Share2 size={15} />
              Share
            </button>
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="section-head">
          <div>
            <span className="section-kicker">Community snapshot</span>
            <h2>What the community says about {resolvedBrandName}</h2>
          </div>
          <Link to={`/feed?brand=${encodeURIComponent(resolvedBrandName)}`} className="inline-link">
            See all discussions <ArrowRight size={15} />
          </Link>
        </div>
        <div className="snapshot-panel">
          <div className="snapshot-stat">
            <strong>◈ {avgCommunityScore}/10</strong>
            <span>Overall brand score</span>
          </div>
          <div className="snapshot-stat">
            <strong>78%</strong>
            <span>Positive sentiment</span>
          </div>
          <div className="snapshot-stat">
            <strong>{totalDiscussions}</strong>
            <span>Posts and comments</span>
          </div>
        </div>
        <div className="feed-stack">
          {topPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              author={users.find((u) => u.id === post.authorId)}
              product={allProducts.find((p) => p.id === post.productId)}
              compact
            />
          ))}
          {topPosts.length === 0 && (
            <p className="empty-label">No community posts yet — be the first to start a conversation.</p>
          )}
        </div>
      </section>

      <section className="section-block">
        <div className="section-head">
          <div>
            <span className="section-kicker">Products</span>
            <h2>All {resolvedBrandName} products on Tiara</h2>
          </div>
        </div>
        <div className="product-rail">
          {brandProducts.map((p) => (
            <Link key={p.id} to={`/product/${p.id}`} className="mini-product-card">
              <img src={p.heroImage} alt={p.name} className="mini-product-image" />
              <div className="mini-product-info">
                <span className="mini-product-name">{p.name}</span>
                <span className="mini-product-price">{formatCurrency(p.price)}</span>
                <span className="mini-product-meta">★ {p.rating} · ◈ {p.communityScore}/10</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {topPosts.length > 0 && (
        <section className="section-block">
          <div className="section-head">
            <div>
              <span className="section-kicker">Top community posts</span>
              <h2>Most upvoted discussions about {resolvedBrandName}</h2>
            </div>
            <Link to={`/feed?brand=${encodeURIComponent(resolvedBrandName)}`} className="inline-link">
              See all <ArrowRight size={15} />
            </Link>
          </div>
          <div className="feed-stack">
            {topPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                author={users.find((u) => u.id === post.authorId)}
                product={allProducts.find((p) => p.id === post.productId)}
              />
            ))}
          </div>
        </section>
      )}

      <section className="section-block">
        <div className="section-head">
          <div>
            <span className="section-kicker">About the brand</span>
            <h2>{resolvedBrandName}</h2>
          </div>
        </div>
        <div className="detail-card">
          <p>
            {resolvedBrandName} is one of the brands available exclusively on Tiara, sold directly to you with full
            authenticity guaranteed. Every product is sourced directly from the brand — no third-party sellers,
            no authenticity concerns.
          </p>
        </div>
      </section>
    </div>
  )
}
