import { MessageCircle, Share2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { PostCard } from '../components/ui/PostCard'
import { useComments, usePosts, useProducts, useUsers } from '../hooks/useTiaraData'
import { brandSlug as toBrandSlug } from '../lib/utils'

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

export function BrandPage() {
  const { brandSlug = '' } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const brandParam = decodeURIComponent(brandSlug)

  const { data: allProducts = [] } = useProducts()
  const { data: posts = [] } = usePosts()
  const { data: comments = [] } = useComments()
  const { data: users = [] } = useUsers()

  const [activeTab, setActiveTab] = useState<'posts' | 'comments'>('posts')

  const resolvedBrandName =
    allProducts.find((product) => product.brand === brandParam || toBrandSlug(product.brand) === brandParam)?.brand ??
    brandParam
  const brandProducts = allProducts.filter((p) => p.brand === resolvedBrandName)

  if (brandProducts.length === 0) {
    return <div className="empty-state">We could not find that brand.</div>
  }

  const brandPosts = posts.filter((p) => p.brand === resolvedBrandName || brandProducts.some((bp) => bp.id === p.productId))
  const brandComments = comments.filter((c) => {
    const post = posts.find((p) => p.id === c.postId)
    return post && (post.brand === resolvedBrandName || brandProducts.some((bp) => bp.id === post.productId))
  })

  const totalDiscussions = brandPosts.length + brandComments.length
  const brandSummary = BRAND_SUMMARIES[resolvedBrandName] ?? "Community is actively discussing this brand's products."

  const coverImage = brandProducts[0].heroImage

  // Sentiment score
  const avgCommunityScore = (
    brandProducts.reduce((sum, p) => sum + p.communityScore, 0) / brandProducts.length
  ).toFixed(1)
  const sentimentPct = sentimentFromScore(parseFloat(avgCommunityScore), resolvedBrandName)
  const sentimentColor = sentimentColour(sentimentPct)

  const displayedContent = activeTab === 'posts' ? brandPosts : brandComments.map((comment) => {
    const post = posts.find((p) => p.id === comment.postId)
    const author = users.find((u) => u.id === comment.authorId)
    return { comment, post, author }
  })

  return (
    <div className="page-stack">
      <section className="brand-hero">
        <div className="brand-cover" style={{ backgroundImage: `url(${coverImage})` }} />
        <div className="brand-hero-body">
          <div className="brand-identity">
            <img src={coverImage} alt={resolvedBrandName} className="brand-logo" />
            <div>
              <h1 className="brand-name">{resolvedBrandName}</h1>
              <p className="brand-tagline">{brandSummary}</p>
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
        <div className="snapshot-panel">
          <div className="snapshot-stat">
            <div className="discover-product-sentiment">
              <div className="discover-sentiment-bar-track">
                <div className="discover-sentiment-bar-fill" style={{ width: `${sentimentPct}%`, background: sentimentColor }} />
              </div>
              <span className="discover-sentiment-label" style={{ color: sentimentColor }}>{sentimentPct}% positive</span>
            </div>
            <span>Sentiment score</span>
          </div>
          <div className="snapshot-stat">
            <strong>{totalDiscussions}</strong>
            <span>Posts and comments</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="pdp-tabs">
          <button
            type="button"
            className={`pdp-tab ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            Posts
            <span className="pdp-tab-count">{brandPosts.length}</span>
          </button>
          <button
            type="button"
            className={`pdp-tab ${activeTab === 'comments' ? 'active' : ''}`}
            onClick={() => setActiveTab('comments')}
          >
            Comments
            <span className="pdp-tab-count">{brandComments.length}</span>
          </button>
        </div>

        {/* Tab content */}
        <div className="pdp-tab-content">
          {activeTab === 'posts' && (
            <div className="feed-stack">
              {brandPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  author={users.find((u) => u.id === post.authorId)}
                  product={allProducts.find((p) => p.id === post.productId)}
                  compact
                />
              ))}
              {brandPosts.length === 0 && (
                <p className="empty-label">No community posts yet — be the first to start a conversation.</p>
              )}
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="pdp-comments-list">
              {displayedContent.map((item: any) => {
                const { comment, post, author } = item
                return (
                  <Link to={`/feed/${post.id}`} key={comment.id} className="pdp-comment-item">
                    <div className="pdp-comment-thread-title">{post.title}</div>
                    <div className="pdp-comment-body">
                      <img src={author.avatar} alt={author.name} className="avatar-sm" />
                      <div className="pdp-comment-right">
                        <span className="pdp-comment-author">{author.name}</span>
                        <p className="pdp-comment-text">{comment.body}</p>
                        <div className="pdp-comment-meta">
                          <span>{comment.upvotes} upvotes</span>
                          <span>·</span>
                          <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
              {brandComments.length === 0 && (
                <p className="empty-label">No community comments yet.</p>
              )}
            </div>
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
        <div className="discover-product-grid">
          {brandProducts.map((product) => {
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
                    onClick={() => navigate(`/brand/${toBrandSlug(product.brand)}`)}
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
      </section>
    </div>
  )
}
