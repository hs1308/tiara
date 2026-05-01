import { ArrowRight, Bell, BellOff, MessageCircle, Pencil, ShoppingBag, Star, ThumbsUp } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { AddReviewModal } from '../components/ui/AddReviewModal'
import { PostCard } from '../components/ui/PostCard'
import { useAddToCart, useComments, usePosts, useProduct, useProducts, useUsers } from '../hooks/useTiaraData'
import { formatCurrency } from '../lib/format'
import type { Product } from '../types'

type CommunityTab = 'posts' | 'comments' | 'reviews'

// Mock reviews since we don't have a reviews table yet
const MOCK_REVIEWS = [
  { id: 'r1', authorName: 'Priya S.', skinType: 'Oily', rating: 5, body: 'Been using this for 3 months and my texture has genuinely improved. Pores look smaller and acne marks are fading.', date: '2026-04-20' },
  { id: 'r2', authorName: 'Meera K.', skinType: 'Combination', rating: 4, body: 'Lightweight, no stinging, works well under sunscreen. Took 6 weeks to see results but worth it.', date: '2026-04-15' },
  { id: 'r3', authorName: 'Ananya R.', skinType: 'Sensitive', rating: 4, body: 'Gentle enough for sensitive skin. Did not break me out which most actives do. Subtle but real results.', date: '2026-04-10' },
]

function StarRow({ rating }: { rating: number }) {
  return (
    <span className="pdp-star-row">
      {[1,2,3,4,5].map((s) => (
        <Star key={s} size={13} fill={s <= rating ? 'currentColor' : 'none'} />
      ))}
    </span>
  )
}

export function ProductPage() {
  const { productId = '' } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { data: product } = useProduct(productId)
  const { data: posts = [] } = usePosts()
  const { data: allComments = [] } = useComments()
  const { data: users = [] } = useUsers()
  const { data: allProducts = [] } = useProducts()
  const addToCart = useAddToCart()

  const [followed, setFollowed] = useState(false)
  const [communityTab, setCommunityTab] = useState<CommunityTab>('posts')
  const [showReviewModal, setShowReviewModal] = useState(false)

  if (!product) {
    return <div className="empty-state">We could not find that product.</div>
  }

  // Community data
  const productPosts = posts.filter((post) => post.productId === product.id)
  const productComments = allComments.filter((c) => {
    if (c.body.startsWith('AI_SUMMARY')) return false
    const parent = posts.find((p) => p.id === c.postId)
    return parent?.productId === product.id
  })

  // Alternate products recommended by community
  // Find products in same category from other brands that have community posts
  const alternates = allProducts
    .filter((p) => p.id !== product.id && p.category === product.category && p.brand !== product.brand)
    .sort((a, b) => b.communityScore - a.communityScore)
    .slice(0, 3)

  // For each alternate, get up to 3 top comments/post snippets
  function getAlternateOpinions(p: Product) {
    const pPosts = posts.filter((post) => post.productId === p.id).sort((a, b) => b.upvotes - a.upvotes)
    const pComments = allComments
      .filter((c) => {
        const parent = posts.find((post) => post.id === c.postId)
        return parent?.productId === p.id && !c.body.startsWith('AI_SUMMARY')
      })
      .sort((a, b) => b.upvotes - a.upvotes)

    type Opinion = { authorId: string; text: string; threadId: string }
    const opinions: Opinion[] = []
    for (const post of pPosts.slice(0, 3)) {
      opinions.push({ authorId: post.authorId, text: post.title, threadId: post.id })
    }
    for (const c of pComments) {
      if (opinions.length >= 3) break
      const parent = posts.find((post) => post.id === c.postId)
      if (parent) opinions.push({ authorId: c.authorId, text: c.body, threadId: parent.id })
    }
    return opinions
  }

  return (
    <div className="page-stack">

      {/* ── Hero ── */}
      <section className="product-hero">
        <div className="gallery-block">
          <img src={product.gallery[0]} alt={product.name} className="product-hero-image" />
          <div className="gallery-row">
            {product.gallery.map((image) => (
              <img key={image} src={image} alt={product.name} className="gallery-thumb" />
            ))}
          </div>
        </div>
        <div className="product-summary">
          <div className="product-summary-toprow">
            <Link to={`/brand/${encodeURIComponent(product.brand)}`} className="section-kicker brand-link">
              {product.brand}
            </Link>
            <button
              type="button"
              className={`pdp-follow-btn${followed ? ' followed' : ''}`}
              onClick={() => setFollowed((f) => !f)}
              title={followed ? 'Unfollow product' : 'Follow product'}
            >
              {followed ? <BellOff size={16} /> : <Bell size={16} />}
              {followed ? 'Following' : 'Follow'}
            </button>
          </div>
          <h1>{product.name}</h1>
          <p>{product.description}</p>
          <div className="price-stack">
            <strong>{formatCurrency(product.price)}</strong>
            <span>{formatCurrency(product.originalPrice)}</span>
          </div>
          <div className="metric-row large">
            <span>★ {product.rating} ({product.ratingsCount})</span>
            <span>◈ {product.communityScore}/10</span>
            <span>{product.discussionCount} discussing</span>
          </div>
          <div className="card-actions split">
            <button
              type="button"
              className="primary-button"
              onClick={() => addToCart.mutate(product.id)}
            >
              <ShoppingBag size={15} />
              Add to cart
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                navigate(`/create?productId=${product.id}&type=Product%20Talk`, {
                  state: { backgroundLocation: location },
                })
              }
            >
              <MessageCircle size={15} />
              Ask the community
            </button>
          </div>
        </div>
      </section>

      {/* ── Product details (moved up) ── */}
      <section className="section-block">
        <div className="section-head">
          <div>
            <span className="section-kicker">Product details</span>
          </div>
        </div>
        <div className="details-grid">
          <div className="detail-card">
            <h3>Ingredients</h3>
            <ul className="simple-list">
              {product.ingredients.map((ingredient) => (
                <li key={ingredient}>{ingredient}</li>
              ))}
            </ul>
          </div>
          <div className="detail-card">
            <h3>Best for</h3>
            <ul className="simple-list">
              {product.suitability.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="detail-card">
            <h3>How to use</h3>
            <p>{product.howToUse}</p>
          </div>
        </div>
      </section>

      {/* ── What the community is saying ── */}
      <section className="section-block">
        <div className="section-head">
          <div>
            <span className="section-kicker">What the community is saying</span>
            <h2>Social proof, context, and the nuanced bits that star ratings miss</h2>
          </div>
          <Link to={`/feed?product=${product.id}`} className="inline-link">
            See all <ArrowRight size={15} />
          </Link>
        </div>

        {/* Sentiment stats */}
        <div className="snapshot-panel">
          <div className="snapshot-stat">
            <strong>78%</strong>
            <span>Positive sentiment</span>
          </div>
          <div className="snapshot-stat">
            <strong>{product.discussionCount}</strong>
            <span>Posts and comments</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="pdp-tabs">
          {(['posts', 'comments', 'reviews'] as CommunityTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              className={`pdp-tab${communityTab === tab ? ' active' : ''}`}
              onClick={() => setCommunityTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span className="pdp-tab-count">
                {tab === 'posts' ? productPosts.length
                  : tab === 'comments' ? productComments.length
                  : MOCK_REVIEWS.length}
              </span>
            </button>
          ))}
        </div>

        {/* Posts tab */}
        {communityTab === 'posts' && (
          <div className="pdp-tab-content">
            <button
              type="button"
              className="pdp-create-prompt"
              onClick={() => navigate(`/create?productId=${product.id}&type=Product%20Talk`, {
                state: { backgroundLocation: location },
              })}
            >
              <Pencil size={14} />
              Share your experience with this product…
            </button>
            <div className="feed-stack">
              {productPosts.length > 0 ? productPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  author={users.find((u) => u.id === post.authorId)}
                  product={product}
                  compact
                />
              )) : (
                <div className="empty-state">No posts yet. Be the first to share your thoughts.</div>
              )}
            </div>
          </div>
        )}

        {/* Comments tab */}
        {communityTab === 'comments' && (
          <div className="pdp-tab-content">
            <div className="pdp-comments-list">
              {productComments.length > 0 ? productComments.map((comment) => {
                const parent = posts.find((p) => p.id === comment.postId)
                const author = users.find((u) => u.id === comment.authorId)
                return (
                  <Link key={comment.id} to={`/feed/${comment.postId}`} className="pdp-comment-item">
                    <div className="pdp-comment-thread-title">{parent?.title}</div>
                    <div className="pdp-comment-body">
                      <img src={author?.avatar} alt={author?.name} className="avatar-xs" />
                      <div className="pdp-comment-right">
                        <span className="pdp-comment-author">{author?.name}</span>
                        <p className="pdp-comment-text">{comment.body}</p>
                        <div className="pdp-comment-meta">
                          <ThumbsUp size={12} />
                          <span>{comment.upvotes}</span>
                          <span className="dot-sep">·</span>
                          <span>{new Date(comment.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              }) : (
                <div className="empty-state">No comments yet.</div>
              )}
            </div>
          </div>
        )}

        {/* Reviews tab */}
        {communityTab === 'reviews' && (
          <div className="pdp-tab-content">
            <button
              type="button"
              className="pdp-create-prompt"
              onClick={() => setShowReviewModal(true)}
            >
              <Pencil size={14} />
              Write a review…
            </button>
            <div className="pdp-reviews-avg">
              <span className="pdp-reviews-score">{product.rating}</span>
              <StarRow rating={Math.round(product.rating)} />
              <span className="pdp-reviews-count">{product.ratingsCount} ratings</span>
            </div>
            <div className="pdp-reviews-list">
              {MOCK_REVIEWS.map((review) => (
                <div key={review.id} className="pdp-review-item">
                  <div className="pdp-review-header">
                    <div>
                      <span className="pdp-review-author">{review.authorName}</span>
                      <span className="pdp-review-skin">{review.skinType} skin</span>
                    </div>
                    <StarRow rating={review.rating} />
                  </div>
                  <p className="pdp-review-body">{review.body}</p>
                  <span className="pdp-review-date">{new Date(review.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── Alternate products recommended by the community ── */}
      {alternates.length > 0 && (
        <section className="section-block">
          <div className="section-head">
            <div>
              <span className="section-kicker">Community recommended</span>
              <h2>Alternate products people talk about</h2>
            </div>
          </div>
          <div className="nl2-grid">
            {alternates.map((p) => {
              const opinions = getAlternateOpinions(p)
              const ingredients = Array.isArray(p.ingredients) ? p.ingredients.slice(0, 3) : []
              return (
                <div key={p.id} className="nl2-card">
                  <Link to={`/product/${p.id}`} className="nl2-product-header">
                    <img src={p.heroImage} alt={p.name} className="nl2-product-image" />
                    <div className="nl2-product-info">
                      <div className="nl2-product-top">
                        <span className="eyebrow">{p.brand}</span>
                      </div>
                      <strong className="nl2-product-name">{p.name}</strong>
                      <p className="nl2-product-desc">
                        {p.description.length > 80 ? p.description.slice(0, 80) + '…' : p.description}
                      </p>
                      {ingredients.length > 0 && (
                        <p className="nl2-ingredients">{ingredients.join(' · ')}</p>
                      )}
                      <span className="nl2-sentiment">{p.communityScore}/10 community score</span>
                    </div>
                  </Link>
                  <div className="nl2-divider" />
                  <div className="nl2-opinions">
                    {opinions.length > 0 ? opinions.map((op, i) => {
                      const author = users.find((u) => u.id === op.authorId)
                      return (
                        <Link key={i} to={`/feed/${op.threadId}`} className="nl2-opinion">
                          <img src={author?.avatar} alt={author?.name} className="avatar-sm" />
                          <div className="nl2-opinion-body">
                            <span className="nl2-opinion-author">{author?.name}</span>
                            <p className="nl2-opinion-text">
                              {op.text.length > 100 ? op.text.slice(0, 100) + '…' : op.text}
                            </p>
                          </div>
                        </Link>
                      )
                    }) : (
                      <p className="nl2-no-opinions">No community opinions yet.</p>
                    )}
                  </div>
                  <Link to={`/feed?product=${p.id}`} className="nl2-see-more">
                    <MessageCircle size={13} />
                    See community opinions
                  </Link>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {showReviewModal && (
        <AddReviewModal
          preselectedProduct={product}
          onClose={() => setShowReviewModal(false)}
        />
      )}

    </div>
  )
}
