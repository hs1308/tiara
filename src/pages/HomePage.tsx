import { MessageCircle, Search, ThumbsUp } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaceScanModal } from '../components/ui/FaceScanModal'
import { PostCard } from '../components/ui/PostCard'
import { useCurrentUser, useComments, usePosts, useProducts, useUsers } from '../hooks/useTiaraData'
import type { Comment, Post, Product } from '../types'

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

// Module 2 helpers
const USER_CONCERNS = ['pigmentation', 'acne', 'combination', 'frizz', 'dry', 'sunscreen', 'moisturiser']

function getCommunityProducts(products: Product[], excludeIds: Set<string>) {
  const scored = products
    .filter((p) => !excludeIds.has(p.id))
    .map((p) => {
      const haystack = [
        p.name, p.description, p.category,
        ...(Array.isArray(p.tags) ? p.tags : []),
        ...(Array.isArray(p.suitability) ? p.suitability : []),
      ].join(' ').toLowerCase()
      const score = USER_CONCERNS.filter((c) => haystack.includes(c)).length
      return { product: p, score }
    })
    .sort((a, b) => b.score - a.score || b.product.discussionCount - a.product.discussionCount)
  return scored.slice(0, 3).map((s) => s.product)
}

function getBestPostForProduct(
  productId: string,
  posts: Post[],
  comments: Comment[],
): { type: 'post'; item: Post } | { type: 'comment'; item: Comment; post: Post } | null {
  // Try a post directly tagged to this product
  const directPost = [...posts]
    .filter((p) => p.productId === productId)
    .sort((a, b) => b.upvotes - a.upvotes)[0]
  if (directPost) return { type: 'post', item: directPost }

  // Try a comment on a post tagged to this product
  const commentMatch = [...comments]
    .filter((c) => {
      const parent = posts.find((p) => p.id === c.postId)
      return parent?.productId === productId
    })
    .sort((a, b) => b.upvotes - a.upvotes)[0]
  if (commentMatch) {
    const parentPost = posts.find((p) => p.id === commentMatch.postId)
    if (parentPost) return { type: 'comment', item: commentMatch, post: parentPost }
  }

  // Fall back to highest upvoted post overall
  const fallback = [...posts].sort((a, b) => b.upvotes - a.upvotes)[0]
  return fallback ? { type: 'post', item: fallback } : null
}

export function HomePage() {
  const navigate = useNavigate()
  const [showFaceScan, setShowFaceScan] = useState(false)
  const { data: user } = useCurrentUser()
  const { data: users = [] } = useUsers()
  const { data: products = [] } = useProducts()
  const { data: posts = [] } = usePosts()
  const { data: allComments = [] } = useComments()

  const contextualPosts = getContextualPosts(posts, products)
  const contextualPostIds = new Set(contextualPosts.map((post) => post.id))
  const livePosts = posts.filter((post) => !contextualPostIds.has(post.id)).slice(0, 3)
  const firstName = user?.name?.split(' ')[0] ?? 'there'
  void firstName

  // Module 2: products people are talking about
  const communityProducts = getCommunityProducts(products, contextualPostIds)

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

      {/* ── Module 2: Products people are talking about ── */}
      {communityProducts.length > 0 && (
        <section className="section-block community-products-module">
          <div className="section-head">
            <div>
              <span className="section-kicker">For you</span>
              <h2>Products people are talking about</h2>
            </div>
            <Link
              to={`/feed?problem=${encodeURIComponent(USER_CONCERNS[0])}`}
              className="inline-link"
            >
              See more discussions
            </Link>
          </div>

          <div className="community-products-table">
            {communityProducts.map((product) => {
              const match = getBestPostForProduct(product.id, posts, allComments)
              const threadPost = match?.type === 'post' ? match.item
                : match?.type === 'comment' ? match.post
                : null
              const snippet = match?.type === 'post'
                ? match.item.title
                : match?.type === 'comment'
                ? match.item.body
                : null
              const snippetAuthor = match?.type === 'post'
                ? users.find((u) => u.id === match.item.authorId)
                : match?.type === 'comment'
                ? users.find((u) => u.id === match.item.authorId)
                : null
              const upvotes = match?.type === 'post' ? match.item.upvotes
                : match?.type === 'comment' ? match.item.upvotes
                : 0

              return (
                <div key={product.id} className="community-product-row">
                  {/* Left: product */}
                  <Link to={`/product/${product.id}`} className="community-product-cell">
                    <img
                      src={product.heroImage}
                      alt={product.name}
                      className="community-product-image"
                    />
                    <div className="community-product-info">
                      <span className="eyebrow">{product.brand}</span>
                      <span className="community-product-name">{product.name}</span>
                      <div className="community-product-meta">
                        <span>★ {product.rating}</span>
                        <span>{product.discussionCount} discussing</span>
                      </div>
                    </div>
                  </Link>

                  {/* Right: community thread */}
                  {threadPost && snippet ? (
                    <Link
                      to={`/feed/${threadPost.id}`}
                      className="community-thread-cell"
                    >
                      <p className="community-thread-snippet">
                        &ldquo;{snippet.length > 120 ? snippet.slice(0, 120) + '…' : snippet}&rdquo;
                      </p>
                      <div className="community-thread-meta">
                        {snippetAuthor && (
                          <img
                            src={snippetAuthor.avatar}
                            alt={snippetAuthor.name}
                            className="avatar-xs"
                          />
                        )}
                        <span>{snippetAuthor?.name}</span>
                        <span className="dot-sep">·</span>
                        <ThumbsUp size={11} />
                        <span>{upvotes}</span>
                      </div>
                    </Link>
                  ) : (
                    <Link
                      to={`/feed?product=${product.id}`}
                      className="community-thread-cell community-thread-empty"
                    >
                      <span>See what the community is saying →</span>
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

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
