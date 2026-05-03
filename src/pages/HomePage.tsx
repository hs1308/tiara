import { MessageCircle, Search, Send, Star, ThumbsUp } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaceScanModal } from '../components/ui/FaceScanModal'
import { AddReviewModal } from '../components/ui/AddReviewModal'
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
  const directPost = [...posts]
    .filter((p) => p.productId === productId)
    .sort((a, b) => b.upvotes - a.upvotes)[0]
  if (directPost) return { type: 'post', item: directPost }

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

  const fallback = [...posts].sort((a, b) => b.upvotes - a.upvotes)[0]
  return fallback ? { type: 'post', item: fallback } : null
}

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
  const communityProducts = getCommunityProducts(products, contextualPostIds)
  const needsYouPosts = getNeedsYouPosts(posts, demoUserId)

  const [replies, setReplies] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState<Record<string, string>>({})
  const [pollVote, setPollVote] = useState<string | null>(null)
  const [pollCounts, setPollCounts] = useState<Record<string, number>>({})
  const [followedPostReply, setFollowedPostReply] = useState('')
  const [followedPostSubmitted, setFollowedPostSubmitted] = useState<string | null>(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewDrafts, setReviewDrafts] = useState<Record<string, string>>({})
  const [reviewSubmitted, setReviewSubmitted] = useState<Record<string, string>>({})

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

      {/* 1. Contextual section */}
      {contextualPosts.length > 0 && (
        <section className="section-block recent-search-module">
          <div className="recent-search-header">
            <div className="recent-search-meta">
              <span className="section-kicker">Based on your recent search</span>
              <span className="topic-badge"><Search size={12} />{CONTEXTUAL_TOPIC}</span>
            </div>
            <Link to={`/feed?problem=${encodeURIComponent(CONTEXTUAL_TOPIC)}`} className="inline-link">See all discussions</Link>
          </div>
          <div className="recent-search-threads-label">
            <div className="contextual-divider"><span>Threads discussing {CONTEXTUAL_TOPIC}</span></div>
          </div>
          <div className="recent-search-posts">
            {contextualPosts.map((post) => {
              const author = users.find((u) => u.id === post.authorId)
              return (
                <Link key={post.id} to={`/feed/${post.id}`} className="search-post-card">
                  <div className="search-post-top">
                    <div className="search-post-stats">
                      <ThumbsUp size={12} /><span>{post.upvotes}</span>
                      <MessageCircle size={12} /><span>{post.commentCount}</span>
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
          <div className="contextual-divider"><span>Products recommended for {CONTEXTUAL_TOPIC}</span></div>
          <div className="contextual-products-list">
            {communityProducts.map((product) => {
              const match = getBestPostForProduct(product.id, posts, allComments)
              const threadPost = match?.type === 'post' ? match.item : match?.type === 'comment' ? match.post : null
              const snippet = match?.type === 'post' ? match.item.title : match?.type === 'comment' ? match.item.body : null
              const postDescription = match?.type === 'post' ? match.item.description : null
              const snippetAuthor = match?.type === 'post' ? users.find((u) => u.id === match.item.authorId) : match?.type === 'comment' ? users.find((u) => u.id === match.item.authorId) : null
              const upvotes = match?.type === 'post' ? match.item.upvotes : match?.type === 'comment' ? match.item.upvotes : 0
              return (
                <div key={product.id} className="contextual-product-row">
                  <Link to={`/product/${product.id}`} className="community-product-cell">
                    <img src={product.heroImage} alt={product.name} className="community-product-image" />
                    <div className="community-product-info">
                      <span className="eyebrow">{product.brand}</span>
                      <span className="community-product-name">{product.name}</span>
                      <div className="community-product-meta">
                        <span>&#9733; {product.rating}</span>
                        <span>{product.discussionCount} discussing</span>
                      </div>
                    </div>
                  </Link>
                  <div className="contextual-product-middle">
                    {threadPost && snippet ? (
                      <Link to={`/feed/${threadPost.id}`} className="community-thread-cell">
                        <p className="community-thread-snippet">&ldquo;{snippet.length > 100 ? snippet.slice(0, 100) + '\u2026' : snippet}&rdquo;</p>
                        {postDescription && <p className="community-thread-description">{postDescription.length > 80 ? postDescription.slice(0, 80) + '\u2026' : postDescription}</p>}
                        <div className="community-thread-meta">
                          {snippetAuthor && <img src={snippetAuthor.avatar} alt={snippetAuthor.name} className="avatar-xs" />}
                          <span>{snippetAuthor?.name}</span>
                          <span className="dot-sep">&middot;</span>
                          <ThumbsUp size={11} /><span>{upvotes}</span>
                        </div>
                      </Link>
                    ) : (
                      <Link to={`/feed?product=${product.id}`} className="community-thread-cell community-thread-empty">
                        <span>See what the community is saying &#8594;</span>
                      </Link>
                    )}
                  </div>
                  <div className="contextual-product-ask">
                    <Link
                      to={`/create?productId=${product.id}&desc=${encodeURIComponent(`@${product.name} `)}`}
                      className="contextual-ask-btn"
                    >
                      <MessageCircle size={14} />Ask a question
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* 2. AMA Promo Card */}
      {(() => {
        const amaPost = posts.find((p) => p.id === 'post-ama-001')
        if (!amaPost?.amaExpert) return null
        const expert = amaPost.amaExpert
        const amaDate = new Date(expert.scheduledAt)
        const isLive = Date.now() >= amaDate.getTime()
        return (
          <section className="section-block ama-promo-card">
            <div className="ama-promo-eyebrow">
              <span className={`ama-live-badge${isLive ? ' ama-live-badge--live' : ''}`}>
                {isLive ? 'Live now' : 'Upcoming AMA'}
              </span>
            </div>
            <div className="ama-promo-body">
              <img src={expert.avatar} alt={expert.name} className="ama-promo-avatar" />
              <div className="ama-promo-info">
                <strong className="ama-promo-name">{expert.name}</strong>
                <span className="ama-promo-title">{expert.title}</span>
                <span className="ama-promo-speciality">{expert.speciality}</span>
                <div className="ama-promo-meta">
                  <span>{amaDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} &middot; {amaDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                  <span>{amaPost.commentCount} questions asked</span>
                </div>
              </div>
            </div>
            <Link to={`/feed/${amaPost.id}`} className="primary-button ama-promo-cta">
              {isLive ? 'Join the AMA now' : 'Ask a question'}
            </Link>
          </section>
        )
      })()}

      {/* 3. Community needs you */}
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
                  <Link to={`/feed/${post.id}`} className="needs-you-post-link">
                    <div className="needs-you-meta">
                      <img src={author?.avatar} alt={author?.name} className="avatar-xs" />
                      <span className="needs-you-author">{author?.name}</span>
                    </div>
                    <p className="needs-you-title">{post.title}</p>
                    {tags.length > 0 && (
                      <div className="tag-row" style={{ marginTop: '6px' }}>
                        {tags.slice(0, 3).map((tag) => <span key={tag} className="tag-pill">{tag}</span>)}
                      </div>
                    )}
                  </Link>
                  <div className="needs-you-reply-area">
                    {hasSubmitted ? (
                      <div className="needs-you-submitted">
                        <div className="needs-you-submitted-comment">
                          <img src={user?.avatar} alt={user?.name} className="avatar-xs" />
                          <p>{submitted[post.id]}</p>
                        </div>
                        <Link to={`/feed/${post.id}`} className="needs-you-join-nudge"><MessageCircle size={13} />Join the full discussion</Link>
                      </div>
                    ) : (
                      <div className="needs-you-reply-row">
                        <img src={user?.avatar} alt={user?.name} className="avatar-xs" />
                        <textarea
                          className="needs-you-textarea"
                          placeholder="Share what works for you..."
                          rows={2}
                          value={replies[post.id] ?? ''}
                          onChange={(e) => handleReplyChange(post.id, e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleReplySubmit(post.id) }}
                        />
                        <button type="button" className="needs-you-send" disabled={!replies[post.id]?.trim() || createComment.isPending} onClick={() => handleReplySubmit(post.id)} aria-label="Send reply">
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

      {/* 4. Community topics carousel */}
      {(() => {
        const CATEGORY_COLOURS: Record<string, { bg: string; border: string; label: string }> = {
          Skincare:   { bg: '#e8f5e9', border: '#a5d6a7', label: '#2e7d32' },
          Makeup:     { bg: '#fff3e0', border: '#ffcc80', label: '#e65100' },
          Haircare:   { bg: '#e3f2fd', border: '#90caf9', label: '#1565c0' },
          Nailcare:   { bg: '#fce4ec', border: '#f48fb1', label: '#880e4f' },
          Fragrance:  { bg: '#f3e5f5', border: '#ce93d8', label: '#6a1b9a' },
          'Lip care': { bg: '#fff8e1', border: '#ffe082', label: '#f57f17' },
        }
        const userInterests: InterestCategory[] = (user?.interests?.length ? user.interests : ['Skincare', 'Makeup', 'Haircare', 'Nailcare', 'Fragrance', 'Lip care']) as InterestCategory[]
        const TERMS_MAP: Record<string, string[]> = {
          Skincare:   ['skincare','skin','serum','moisturiser','sunscreen','toner','cleanser'],
          Makeup:     ['makeup','foundation','concealer','lipstick','blush','eyeshadow','mascara'],
          Haircare:   ['hair','haircare','frizz','shampoo','conditioner','scalp','hair fall'],
          Nailcare:   ['nail','nails','nail polish','nailcare','manicure'],
          Fragrance:  ['fragrance','perfume','mist','scent','attar'],
          'Lip care': ['lip','lips','lip balm','lip care','lip oil'],
        }
        const categoryCards = userInterests.map((cat) => {
          const terms = [cat.toLowerCase(), ...(TERMS_MAP[cat] ?? [])]
          const catPosts = posts.filter((post) => {
            const haystack = [post.title, post.description, post.type, post.brand, ...(Array.isArray(post.tags) ? post.tags : []), products.find((p) => p.id === post.productId)?.category ?? ''].join(' ').toLowerCase()
            return terms.some((t) => haystack.includes(t))
          }).sort((a, b) => b.upvotes - a.upvotes).slice(0, 2)
          return { cat, posts: catPosts, colour: CATEGORY_COLOURS[cat] }
        }).filter((c) => c.posts.length > 0)
        if (!categoryCards.length) return null
        return (
          <section className="section-block community-topics-section">
            <div className="section-head">
              <div><h2>What the community is talking about</h2></div>
              <Link to="/feed" className="inline-link">Go to feed</Link>
            </div>
            <div className="community-topics-rail">
              {categoryCards.map(({ cat, posts: catPosts, colour }) => (
                <div key={cat} className="topic-card" style={{ background: colour.bg, borderColor: colour.border } as React.CSSProperties}>
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
                    <Link to={`/feed?care=${encodeURIComponent(cat)}`} className="topic-action-btn topic-see-more" style={{ borderColor: colour.border, color: colour.label }}>See more</Link>
                    <Link to={`/create?type=Rec%20Request&tag=${encodeURIComponent(cat)}`} className="topic-action-btn topic-ask" style={{ background: colour.border, color: colour.label }}>Ask a question</Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )
      })()}

      {/* 5. Poll Promo Card */}
      {(() => {
        const pollPost = posts.find((p) => p.id === 'post-poll-001')
        if (!pollPost?.pollOptions) return null
        const options = pollPost.pollOptions
        const totalVotes = options.reduce((s, o) => s + o.votes, 0) + Object.values(pollCounts).reduce((s, v) => s + v, 0)
        const hasVoted = pollVote !== null
        return (
          <section className="section-block poll-promo-card">
            <span className="section-kicker">Community Poll</span>
            <h2 className="poll-promo-question">{pollPost.title}</h2>
            <div className="poll-promo-options">
              {options.map((opt) => {
                const myExtra = pollCounts[opt.id] ?? 0
                const count = opt.votes + myExtra
                const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0
                const isChosen = pollVote === opt.id
                return (
                  <button key={opt.id} type="button" className={`poll-option-btn${isChosen ? ' poll-option-btn--chosen' : ''}`}
                    onClick={() => { if (hasVoted) return; setPollVote(opt.id); setPollCounts((prev) => ({ ...prev, [opt.id]: (prev[opt.id] ?? 0) + 1 })) }}
                    disabled={hasVoted}>
                    <span className="poll-option-label">{opt.label}</span>
                    {hasVoted && (<><div className="poll-option-bar" style={{ width: `${pct}%` }} /><span className="poll-option-pct">{pct}%</span></>)}
                  </button>
                )
              })}
            </div>
            {!hasVoted && <p className="poll-vote-hint">Vote to see results</p>}
            {hasVoted && <p className="poll-total-hint">{totalVotes.toLocaleString()} votes total</p>}
            <Link to={`/feed/${pollPost.id}`} className="inline-link poll-promo-cta"><MessageCircle size={14} /> Join the conversation</Link>
          </section>
        )
      })()}

      {/* 6. Followed product post */}
      {(() => {
        const fp = posts.find((p) => p.id === 'post-followed-001')
        if (!fp) return null
        const fpAuthor = users.find((u) => u.id === fp.authorId)
        const fpProduct = products.find((p) => p.id === fp.productId)
        const fpComments = allComments.filter((c) => c.postId === fp.id).slice(0, 2)
        return (
          <section className="section-block followed-post-card">
            <div className="followed-post-eyebrow">
              <img src={fpAuthor?.avatar} alt={fpAuthor?.name} className="avatar-xs" />
              <span><strong>{fpAuthor?.name}</strong> posted about <Link to={`/product/${fpProduct?.id}`} style={{ textDecoration: 'underline' }}><strong>{fpProduct?.name ?? fp.brand}</strong></Link></span>
            </div>
            <Link to={`/feed/${fp.id}`} className="followed-post-main">
              <strong className="followed-post-title">{fp.title}</strong>
              <p className="followed-post-desc">{fp.description}</p>
              {fp.image && <img src={fp.image} alt={fp.title} className="followed-post-image" />}
              <div className="followed-post-stats">
                <span><ThumbsUp size={13} /> {fp.upvotes}</span>
                <span><MessageCircle size={13} /> {fp.commentCount} comments</span>
              </div>
            </Link>
            {fpComments.length > 0 && (
              <div className="followed-post-comments">
                {fpComments.map((c) => {
                  const ca = users.find((u) => u.id === c.authorId)
                  return (
                    <div key={c.id} className="followed-post-comment">
                      <img src={ca?.avatar} alt={ca?.name} className="avatar-xs" />
                      <p>{c.body.length > 100 ? c.body.slice(0, 100) + '...' : c.body}</p>
                    </div>
                  )
                })}
              </div>
            )}
            <div className="followed-post-compose">
              {followedPostSubmitted ? (
                <div className="followed-post-submitted">
                  <span>Your comment was added.</span>
                  <Link to={`/feed/${fp.id}`} className="needs-you-join-nudge"><MessageCircle size={13} /> Join discussion</Link>
                </div>
              ) : (
                <div className="needs-you-reply-row">
                  <img src={user?.avatar} alt={user?.name} className="avatar-xs" />
                  <textarea className="needs-you-textarea" rows={2} placeholder="Add a comment..." value={followedPostReply}
                    onChange={(e) => setFollowedPostReply(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && followedPostReply.trim()) { createComment.mutateAsync({ postId: fp.id, authorId: demoUserId, body: followedPostReply.trim(), parentId: null }); setFollowedPostSubmitted(followedPostReply.trim()); setFollowedPostReply('') } }}
                  />
                  <button type="button" className="needs-you-send" disabled={!followedPostReply.trim() || createComment.isPending}
                    onClick={async () => { if (!followedPostReply.trim()) return; await createComment.mutateAsync({ postId: fp.id, authorId: demoUserId, body: followedPostReply.trim(), parentId: null }); setFollowedPostSubmitted(followedPostReply.trim()); setFollowedPostReply('') }}>
                    <Send size={15} />
                  </button>
                </div>
              )}
            </div>
            <Link to={`/feed/${fp.id}`} className="followed-post-cta">Join discussion</Link>
          </section>
        )
      })()}

      {/* 7. New launches */}
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
                const productPosts = [...posts].filter((p) => p.productId === product.id).sort((a, b) => b.upvotes - a.upvotes)
                const productComments = allComments.filter((c) => { const parent = posts.find((p) => p.id === c.postId); return parent?.productId === product.id && !c.body.startsWith('AI_SUMMARY') }).sort((a, b) => b.upvotes - a.upvotes)
                type Opinion = { kind: 'post'; post: Post } | { kind: 'comment'; comment: Comment; post: Post }
                const opinions: Opinion[] = []
                for (const p of productPosts.slice(0, 2)) opinions.push({ kind: 'post', post: p })
                if (opinions.length < 2) { for (const c of productComments) { if (opinions.length >= 2) break; const parent = posts.find((p) => p.id === c.postId); if (parent) opinions.push({ kind: 'comment', comment: c, post: parent }) } }
                const ingredients = Array.isArray(product.ingredients) ? product.ingredients.slice(0, 3) : []
                return (
                  <div key={product.id} className="nl2-card">
                    <Link to={`/product/${product.id}`} className="nl2-product-header">
                      <img src={product.heroImage} alt={product.name} className="nl2-product-image" />
                      <div className="nl2-product-info">
                        <div className="nl2-product-top"><span className="eyebrow">{product.brand}</span><span className="new-launch-badge nl2-badge">New</span></div>
                        <strong className="nl2-product-name">{product.name}</strong>
                        <p className="nl2-product-desc">{product.description.length > 80 ? product.description.slice(0, 80) + '\u2026' : product.description}</p>
                        {ingredients.length > 0 && <p className="nl2-ingredients">{ingredients.join(' \u00b7 ')}</p>}
                        <span className="nl2-sentiment">{product.communityScore}/10 community score</span>
                      </div>
                    </Link>
                    <div className="nl2-divider" />
                    <div className="nl2-opinions">
                      {opinions.length > 0 ? opinions.map((op, i) => {
                        const authorId = op.kind === 'post' ? op.post.authorId : op.comment.authorId
                        const threadId = op.post.id
                        const body = op.kind === 'post' ? op.post.title : op.comment.body
                        const author = users.find((u) => u.id === authorId)
                        return (
                          <Link key={i} to={`/feed/${threadId}`} className="nl2-opinion">
                            <img src={author?.avatar} alt={author?.name} className="avatar-sm" />
                            <div className="nl2-opinion-body">
                              <span className="nl2-opinion-author">{author?.name}</span>
                              <p className="nl2-opinion-text">{body.length > 100 ? body.slice(0, 100) + '\u2026' : body}</p>
                            </div>
                          </Link>
                        )
                      }) : <p className="nl2-no-opinions">Be the first to share your thoughts.</p>}
                    </div>
                    <Link to={`/feed?product=${product.id}`} className="nl2-see-more"><MessageCircle size={13} />See other opinions</Link>
                  </div>
                )
              })}
            </div>
          </section>
        )
      })()}

      {/* 8. Expert spotlight */}
      {(() => {
        const expertPost = posts.find((p) => p.id === 'post-expert-001')
        if (!expertPost) return null
        const expertAuthor = users.find((u) => u.id === expertPost.authorId)
        const expertComments = allComments.filter((c) => c.postId === expertPost.id && !c.body.startsWith('AI_SUMMARY')).slice(0, 2)
        return (
          <section className="section-block expert-spotlight-card">
            <div className="section-head" style={{ marginBottom: '16px' }}>
              <div>
                <span className="section-kicker">Hear from our experts</span>
                <h2>Expert content for you</h2>
              </div>
              <Link to={`/feed/${expertPost.id}`} className="inline-link">Join discussion</Link>
            </div>
            <Link to={`/feed/${expertPost.id}`} className="expert-post-main">
              {expertPost.image && (
                <div className="expert-post-image-wrap">
                  <img src={expertPost.image} alt={expertPost.title} className="expert-post-image" />
                  <div className="expert-video-badge">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                    Video
                  </div>
                </div>
              )}
              <div className="expert-post-body">
                <div className="expert-post-author">
                  <img src={expertAuthor?.avatar} alt={expertAuthor?.name} className="avatar-xs" />
                  <span className="expert-author-name">{expertAuthor?.name}</span>
                  <span className="expert-blue-tick" title="Verified Expert">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#3b82f6"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke="none" /></svg>
                  </span>
                  <span className="expert-title-tag">{expertAuthor?.expertTitle}</span>
                </div>
                <strong className="expert-post-title">{expertPost.title}</strong>
                <p className="expert-post-desc">{expertPost.description.length > 140 ? expertPost.description.slice(0, 140) + '\u2026' : expertPost.description}</p>
                <div className="expert-post-tags">
                  {expertPost.tags.slice(0, 4).map((tag) => <span key={tag} className="tag-pill">{tag}</span>)}
                </div>
                <div className="expert-post-stats">
                  <span><ThumbsUp size={13} /> {expertPost.upvotes}</span>
                  <span><MessageCircle size={13} /> {expertPost.commentCount} comments</span>
                </div>
              </div>
            </Link>
            {expertComments.length > 0 && (
              <div className="expert-post-comments">
                {expertComments.map((c) => {
                  const ca = users.find((u) => u.id === c.authorId)
                  return (
                    <div key={c.id} className="expert-comment-row">
                      <img src={ca?.avatar} alt={ca?.name} className="avatar-xs" />
                      <div className="expert-comment-body">
                        <div className="expert-comment-author">
                          <span>{ca?.name}</span>
                          {ca?.isExpert && (
                            <span className="expert-blue-tick" title="Verified Expert">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="#3b82f6"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke="none" /></svg>
                            </span>
                          )}
                        </div>
                        <p>{c.body.length > 120 ? c.body.slice(0, 120) + '\u2026' : c.body}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            <Link to={`/feed/${expertPost.id}`} className="primary-button expert-join-btn">Join the discussion</Link>
          </section>
        )
      })()}

      {/* 9. Review carousel */}
      {(() => {
        const reviewPosts = posts.filter((p) => p.type === 'Review' && p.rating && p.productId)
        if (!reviewPosts.length) return null
        return (
          <section className="section-block">
            <div className="section-head">
              <div>
                <span className="section-kicker">What people are rating</span>
                <h2>Product reviews from the community</h2>
              </div>
              <button type="button" className="primary-button" style={{ whiteSpace: 'nowrap', fontSize: '0.86rem', padding: '8px 16px' }} onClick={() => setShowReviewModal(true)}>
                <Star size={14} /> Add a review
              </button>
            </div>
            <div className="review-carousel">
              {reviewPosts.map((reviewPost) => {
                const product = products.find((p) => p.id === reviewPost.productId)
                const reviewer = users.find((u) => u.id === reviewPost.authorId)
                const topComment = allComments.filter((c) => c.postId === reviewPost.id && c.authorId !== reviewPost.authorId).sort((a, b) => b.upvotes - a.upvotes)[0]
                const commentAuthor = users.find((u) => u.id === topComment?.authorId)
                const hasSubmitted = !!reviewSubmitted[reviewPost.id]
                return (
                  <div key={reviewPost.id} className="review-card">
                    {product && (
                      <Link to={`/product/${product.id}`} className="review-card-product">
                        <img src={product.heroImage} alt={product.name} className="review-card-product-img" />
                        <div><span className="eyebrow">{product.brand}</span><strong className="review-card-product-name">{product.name}</strong></div>
                      </Link>
                    )}
                    <div className="review-card-stars">
                      {[1,2,3,4,5].map((s) => <Star key={s} size={15} fill={s <= (reviewPost.rating ?? 0) ? '#f59e0b' : 'none'} color={s <= (reviewPost.rating ?? 0) ? '#f59e0b' : '#d1d5db'} strokeWidth={1.5} />)}
                      <span className="review-card-rating-label">{reviewPost.rating}/5</span>
                    </div>
                    <Link to={`/feed/${reviewPost.id}`} className="review-card-body">
                      <div className="review-card-reviewer"><img src={reviewer?.avatar} alt={reviewer?.name} className="avatar-xs" /><span>{reviewer?.name}</span></div>
                      <p className="review-card-text">{reviewPost.description.length > 120 ? reviewPost.description.slice(0, 120) + '\u2026' : reviewPost.description}</p>
                    </Link>
                    {topComment && (
                      <Link to={`/feed/${reviewPost.id}`} className="review-card-comment">
                        <img src={commentAuthor?.avatar} alt={commentAuthor?.name} className="avatar-xs" />
                        <p>{topComment.body.length > 80 ? topComment.body.slice(0, 80) + '\u2026' : topComment.body}</p>
                      </Link>
                    )}
                    <div className="review-card-reply">
                      {hasSubmitted ? (
                        <p className="review-card-submitted">&#10003; Comment added
                          <Link to={`/feed/${reviewPost.id}`} className="needs-you-join-nudge" style={{ marginLeft: 8 }}>View thread</Link>
                        </p>
                      ) : (
                        <div className="needs-you-reply-row">
                          <img src={user?.avatar} alt={user?.name} className="avatar-xs" />
                          <textarea className="needs-you-textarea" rows={2} placeholder="Add a comment..." value={reviewDrafts[reviewPost.id] ?? ''} onChange={(e) => setReviewDrafts((prev) => ({ ...prev, [reviewPost.id]: e.target.value }))} />
                          <button type="button" className="needs-you-send" disabled={!reviewDrafts[reviewPost.id]?.trim() || createComment.isPending}
                            onClick={async () => { const body = reviewDrafts[reviewPost.id]?.trim(); if (!body) return; await createComment.mutateAsync({ postId: reviewPost.id, authorId: demoUserId, body, parentId: null }); setReviewSubmitted((prev) => ({ ...prev, [reviewPost.id]: body })); setReviewDrafts((prev) => ({ ...prev, [reviewPost.id]: '' })) }}>
                            <Send size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )
      })()}

      {/* 10. CTA Band */}
      <section className="section-block cta-band">
        <div>
          <span className="section-kicker">Complete your profile</span>
          <h2>Sharper skincare picks, better community context, stronger recommendations.</h2>
        </div>
        <button type="button" className="primary-button" onClick={() => setShowFaceScan(true)}>Analyse Face</button>
      </section>

      {showFaceScan && (
        <FaceScanModal onClose={() => setShowFaceScan(false)} onComplete={(_results) => { setShowFaceScan(false); navigate('/profile') }} />
      )}
      {showReviewModal && <AddReviewModal onClose={() => setShowReviewModal(false)} />}
    </div>
  )
}
