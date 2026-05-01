import { MessageCircle, Search, Send, ThumbsUp } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaceScanModal } from '../components/ui/FaceScanModal'
import { useCurrentUser, useComments, useCreateComment, usePosts, useProducts, useUsers } from '../hooks/useTiaraData'
import { demoUserId, mockProducts } from '../data/mockData'
import type { Comment, InterestCategory, Post, Product } from '../types'

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

// Module 3 helper
const NEEDS_YOU_TYPES = ['Rec Request', 'Skin & Hair Help']
const NEEDS_YOU_TERMS = ['pigmentation', 'acne', 'combination', 'frizz', 'dry', 'sunscreen', 'moisturiser', 'dark circle', 'oily', 'sensitive', 'hair', 'skin']

function getNeedsYouPosts(posts: Post[], currentUserId: string) {
  return posts
    .filter((post) => {
      if (post.authorId === currentUserId) return false
      if (!NEEDS_YOU_TYPES.includes(post.type)) return false
      if (post.commentCount >= 50) return false
      const haystack = [
        post.title, post.description,
        ...(Array.isArray(post.tags) ? post.tags : []),
      ].join(' ').toLowerCase()
      return NEEDS_YOU_TERMS.some((t) => haystack.includes(t))
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3)
}

export function HomePage() {
  const navigate = useNavigate()
  const [showFaceScan, setShowFaceScan] = useState(false)
  const { data: user } = useCurrentUser()
  const { data: users = [] } = useUsers()
  const { data: products = [] } = useProducts()
  const { data: posts = [] } = usePosts()
  const { data: allComments = [] } = useComments()
  const createComment = useCreateComment()

  const contextualPosts = getContextualPosts(posts, products)
  const contextualPostIds = new Set(contextualPosts.map((post) => post.id))
  const firstName = user?.name?.split(' ')[0] ?? 'there'
  void firstName

  // Module 2
  const communityProducts = getCommunityProducts(products, contextualPostIds)

  // Module 3
  const needsYouPosts = getNeedsYouPosts(posts, demoUserId)
  const [replies, setReplies] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState<Record<string, string>>({})

  function handleReplyChange(postId: string, value: string) {
    setReplies((prev) => ({ ...prev, [postId]: value }))
  }

  async function handleReplySubmit(postId: string) {
    const body = replies[postId]?.trim()
    if (!body) return
    await createComment.mutateAsync({ postId, authorId: demoUserId, body, parentId: null })
    setSubmitted((prev) => ({ ...prev, [postId]: body }))
    setReplies((prev) => ({ ...prev, [postId]: '' }))
  }

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

      {/* ── Module 3: Your community needs you ── */}
      {needsYouPosts.length > 0 && (
        <section className="section-block needs-you-module">
          <div className="section-head">
            <div>
              <span className="section-kicker">Your community needs you</span>
              <h2>These people could use your help</h2>
            </div>
            <Link to="/feed?sort=New" className="inline-link">Go to feed</Link>
          </div>

          <div className="needs-you-stack">
            {needsYouPosts.map((post) => {
              const author = users.find((u) => u.id === post.authorId)
              const hasSubmitted = !!submitted[post.id]
              const tags = Array.isArray(post.tags) ? post.tags : []

              return (
                <div key={post.id} className="needs-you-card">
                  {/* Post header — tappable to thread */}
                  <Link to={`/feed/${post.id}`} className="needs-you-post-link">
                    <div className="needs-you-meta">
                      <img src={author?.avatar} alt={author?.name} className="avatar-xs" />
                      <span className="needs-you-author">{author?.name}</span>
                      <span className="tag-pill needs-you-type">{post.type}</span>
                    </div>
                    <p className="needs-you-title">{post.title}</p>
                    {tags.length > 0 && (
                      <div className="tag-row" style={{ marginTop: '6px' }}>
                        {tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="tag-pill">{tag}</span>
                        ))}
                      </div>
                    )}
                  </Link>

                  {/* Inline reply */}
                  <div className="needs-you-reply-area">
                    {hasSubmitted ? (
                      <div className="needs-you-submitted">
                        <div className="needs-you-submitted-comment">
                          <img
                            src={user?.avatar}
                            alt={user?.name}
                            className="avatar-xs"
                          />
                          <p>{submitted[post.id]}</p>
                        </div>
                        <Link
                          to={`/feed/${post.id}`}
                          className="needs-you-join-nudge"
                        >
                          <MessageCircle size={13} />
                          Join the full discussion
                        </Link>
                      </div>
                    ) : (
                      <div className="needs-you-reply-row">
                        <img
                          src={user?.avatar}
                          alt={user?.name}
                          className="avatar-xs"
                        />
                        <textarea
                          className="needs-you-textarea"
                          placeholder="Share what works for you…"
                          rows={2}
                          value={replies[post.id] ?? ''}
                          onChange={(e) => handleReplyChange(post.id, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                              handleReplySubmit(post.id)
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="needs-you-send"
                          disabled={!replies[post.id]?.trim() || createComment.isPending}
                          onClick={() => handleReplySubmit(post.id)}
                          aria-label="Send reply"
                        >
                          <Send size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── What the community is talking about ── */}
      {(() => {
        const CATEGORY_COLOURS: Record<string, { bg: string; border: string; label: string }> = {
          Skincare:  { bg: '#e8f5e9', border: '#a5d6a7', label: '#2e7d32' },
          Makeup:    { bg: '#fff3e0', border: '#ffcc80', label: '#e65100' },
          Haircare:  { bg: '#e3f2fd', border: '#90caf9', label: '#1565c0' },
          Nailcare:  { bg: '#fce4ec', border: '#f48fb1', label: '#880e4f' },
          Fragrance: { bg: '#f3e5f5', border: '#ce93d8', label: '#6a1b9a' },
          'Lip care':{ bg: '#fff8e1', border: '#ffe082', label: '#f57f17' },
        }

        // User's interests drive the order, fall back to all categories
        const userInterests: InterestCategory[] = (user?.interests?.length
          ? user.interests
          : ['Skincare', 'Makeup', 'Haircare', 'Nailcare', 'Fragrance', 'Lip care']) as InterestCategory[]

        // For each category, find the top 2 posts by upvotes
        const categoryCards = userInterests
          .map((cat) => {
            const categoryTerms = [cat.toLowerCase(), ...{
              Skincare:  ['skincare', 'skin', 'serum', 'moisturiser', 'sunscreen', 'toner', 'cleanser'],
              Makeup:    ['makeup', 'foundation', 'concealer', 'lipstick', 'blush', 'eyeshadow', 'mascara'],
              Haircare:  ['hair', 'haircare', 'frizz', 'shampoo', 'conditioner', 'scalp', 'hair fall'],
              Nailcare:  ['nail', 'nails', 'nail polish', 'nailcare', 'manicure'],
              Fragrance: ['fragrance', 'perfume', 'mist', 'scent', 'attar'],
              'Lip care':['lip', 'lips', 'lip balm', 'lip care', 'lip oil'],
            }[cat]]

            const catPosts = posts
              .filter((post) => {
                const haystack = [
                  post.title, post.description, post.type, post.brand,
                  ...(Array.isArray(post.tags) ? post.tags : []),
                  products.find((p) => p.id === post.productId)?.category ?? '',
                ].join(' ').toLowerCase()
                return categoryTerms.some((t) => haystack.includes(t))
              })
              .sort((a, b) => b.upvotes - a.upvotes)
              .slice(0, 2)

            return { cat, posts: catPosts, colour: CATEGORY_COLOURS[cat] }
          })
          .filter((c) => c.posts.length > 0)

        if (!categoryCards.length) return null

        return (
          <section className="section-block community-topics-section">
            <div className="section-head">
              <div>
                <h2>What the community is talking about</h2>
              </div>
              <Link to="/feed" className="inline-link">Go to feed</Link>
            </div>

            <div className="community-topics-rail">
              {categoryCards.map(({ cat, posts: catPosts, colour }) => (
                <div
                  key={cat}
                  className="topic-card"
                  style={{
                    background: colour.bg,
                    borderColor: colour.border,
                  } as React.CSSProperties}
                >
                  <h3 className="topic-card-title" style={{ color: colour.label }}>{cat}</h3>

                  <div className="topic-posts">
                    {catPosts.map((post) => {
                      const author = users.find((u) => u.id === post.authorId)
                      return (
                        <Link key={post.id} to={`/feed/${post.id}`} className="topic-post-item">
                          <img src={author?.avatar} alt={author?.name} className="avatar-xs" />
                          <div className="topic-post-body">
                            <span className="topic-post-author">{author?.name}</span>
                            <p className="topic-post-title">{post.title}</p>
                            <span className="topic-post-meta">{post.commentCount} comments</span>
                          </div>
                        </Link>
                      )
                    })}
                  </div>

                  <div className="topic-card-actions">
                    <Link
                      to={`/feed?care=${encodeURIComponent(cat)}`}
                      className="topic-action-btn topic-see-more"
                      style={{ borderColor: colour.border, color: colour.label }}
                    >
                      See more
                    </Link>
                    <Link
                      to={`/create?type=Rec%20Request`}
                      className="topic-action-btn topic-ask"
                      style={{ background: colour.border, color: colour.label }}
                    >
                      Ask a question
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )
      })()}

      {/* ── Module 4: New launches ── */}
      {(() => {
        const newLaunchIds = new Set(mockProducts.filter((p) => p.newLaunch).map((p) => p.id))
        const newLaunches = products.filter((p) => p.newLaunch || newLaunchIds.has(p.id))
        if (!newLaunches.length) return null
        return (
          <section className="section-block">
            <div className="section-head">
              <div>
                <span className="section-kicker">Fresh on Tiara</span>
                <h2>What the community is saying about new launches</h2>
              </div>
            </div>

            <div className="nl2-grid">
              {newLaunches.map((product) => {
                // Get up to 2 posts or comments mentioning this product
                const productPosts = [...posts]
                  .filter((p) => p.productId === product.id)
                  .sort((a, b) => b.upvotes - a.upvotes)
                const productComments = allComments
                  .filter((c) => {
                    const parent = posts.find((p) => p.id === c.postId)
                    return parent?.productId === product.id && !c.body.startsWith('AI_SUMMARY')
                  })
                  .sort((a, b) => b.upvotes - a.upvotes)

                // Build up to 2 opinion items — prefer posts, fill with comments
                type Opinion =
                  | { kind: 'post'; post: Post }
                  | { kind: 'comment'; comment: Comment; post: Post }

                const opinions: Opinion[] = []
                for (const p of productPosts.slice(0, 2)) {
                  opinions.push({ kind: 'post', post: p })
                }
                if (opinions.length < 2) {
                  for (const c of productComments) {
                    if (opinions.length >= 2) break
                    const parent = posts.find((p) => p.id === c.postId)
                    if (parent) opinions.push({ kind: 'comment', comment: c, post: parent })
                  }
                }

                // Key ingredients — show first 3
                const ingredients = Array.isArray(product.ingredients)
                  ? product.ingredients.slice(0, 3)
                  : []

                return (
                  <div key={product.id} className="nl2-card">
                    {/* Product header */}
                    <Link to={`/product/${product.id}`} className="nl2-product-header">
                      <img src={product.heroImage} alt={product.name} className="nl2-product-image" />
                      <div className="nl2-product-info">
                        <div className="nl2-product-top">
                          <span className="eyebrow">{product.brand}</span>
                          <span className="new-launch-badge nl2-badge">New</span>
                        </div>
                        <strong className="nl2-product-name">{product.name}</strong>
                        <p className="nl2-product-desc">{product.description.length > 80 ? product.description.slice(0, 80) + '…' : product.description}</p>
                        {ingredients.length > 0 && (
                          <p className="nl2-ingredients">{ingredients.join(' · ')}</p>
                        )}
                        <span className="nl2-sentiment">
                          {product.communityScore}/10 community score
                        </span>
                      </div>
                    </Link>

                    {/* Divider */}
                    <div className="nl2-divider" />

                    {/* Opinions */}
                    <div className="nl2-opinions">
                      {opinions.length > 0 ? opinions.map((op, i) => {
                        const authorId = op.kind === 'post' ? op.post.authorId : op.comment.authorId
                        const threadId = op.kind === 'post' ? op.post.id : op.post.id
                        const body = op.kind === 'post' ? op.post.title : op.comment.body
                        const author = users.find((u) => u.id === authorId)
                        return (
                          <Link key={i} to={`/feed/${threadId}`} className="nl2-opinion">
                            <img src={author?.avatar} alt={author?.name} className="avatar-sm" />
                            <div className="nl2-opinion-body">
                              <span className="nl2-opinion-author">{author?.name}</span>
                              <p className="nl2-opinion-text">{body.length > 100 ? body.slice(0, 100) + '…' : body}</p>
                            </div>
                          </Link>
                        )
                      }) : (
                        <p className="nl2-no-opinions">Be the first to share your thoughts.</p>
                      )}
                    </div>

                    {/* Footer */}
                    <Link
                      to={`/feed?product=${product.id}`}
                      className="nl2-see-more"
                    >
                      <MessageCircle size={13} />
                      See other opinions
                    </Link>
                  </div>
                )
              })}
            </div>
          </section>
        )
      })()}

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
