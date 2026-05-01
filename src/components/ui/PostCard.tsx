import { ArrowUpRight, MessageCircle, ThumbsUp } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { formatDate } from '../../lib/format'
import { brandSlug } from '../../lib/utils'
import { useProducts, useBrands } from '../../hooks/useTiaraData'
import type { Post, Product, UserProfile } from '../../types'
import type { ReactNode } from 'react'

interface PostCardProps {
  post: Post
  author?: UserProfile
  product?: Product | null
  compact?: boolean
}

function renderBody(body: string, productList: Product[], brandNames: string[]): ReactNode[] {
  // Build entity list sorted longest-first to avoid partial matches
  const entities = [
    ...brandNames.map((name) => ({ name, to: `/brand/${brandSlug(name)}`, type: 'brand' as const })),
    ...productList.map((p) => ({ name: p.name, to: `/product/${p.id}`, type: 'product' as const })),
  ].sort((a, b) => b.name.length - a.name.length)

  const nodes: ReactNode[] = []
  let remaining = body
  let key = 0

  while (remaining.length > 0) {
    const atIdx = remaining.indexOf('@')
    if (atIdx === -1) { nodes.push(remaining); break }
    if (atIdx > 0) { nodes.push(remaining.slice(0, atIdx)); remaining = remaining.slice(atIdx) }
    const afterAt = remaining.slice(1)
    const match = entities.find((e) => afterAt.startsWith(e.name))
    if (match) {
      nodes.push(
        <Link
          key={key++}
          to={match.to}
          className={`mention-link${match.type === 'brand' ? ' mention-link-brand' : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          @{match.name}
        </Link>,
      )
      remaining = remaining.slice(1 + match.name.length)
    } else {
      nodes.push('@')
      remaining = remaining.slice(1)
    }
  }
  return nodes
}

export function PostCard({ post, author, product, compact }: PostCardProps) {
  const navigate = useNavigate()
  const { data: allProducts = [] } = useProducts()
  const { data: allBrands = [] } = useBrands()

  const brandNames = [
    ...allBrands.map((b) => b.name),
    ...new Set(allProducts.map((p) => p.brand)),
  ].filter((name, i, list) => list.indexOf(name) === i)

  const hasAtMention = post.description?.includes('@')

  return (
    <article className={`post-card${compact ? ' compact' : ''}`}>
      <div className="post-meta">
        <div className="author-row">
          <img src={author?.avatar} alt={author?.name} className="avatar-sm" />
          <div>
            <div className="author-name">{author?.name}</div>
            <div className="meta-line">
              {post.type} · {formatDate(post.createdAt)}
            </div>
          </div>
        </div>
        <Link to={`/feed/${post.id}`} className="ghost-link">
          <ArrowUpRight size={16} />
        </Link>
      </div>
      <Link to={`/feed/${post.id}`}>
        <h3 className="post-title">{post.title}</h3>
      </Link>
      {post.type === 'Review' && post.rating && (
        <div className="post-review-stars">
          {[1,2,3,4,5].map((s) => (
            <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill={s <= post.rating! ? '#f59e0b' : 'none'} stroke="#f59e0b" strokeWidth="1.5">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          ))}
          <span className="post-review-label">{post.rating}/5</span>
        </div>
      )}

      {/* Description — render @ mentions as clickable links */}
      <p className="post-description">
        {hasAtMention
          ? renderBody(post.description, allProducts, brandNames)
          : post.description}
      </p>

      {post.image ? <img src={post.image} alt={post.title} className="post-image" /> : null}

      {/* Tags — clickable, navigate to feed filtered by tag */}
      {post.tags?.length > 0 && (
        <div className="tag-row">
          {post.tags.map((tag) => (
            <button
              key={tag}
              type="button"
              className="tag-pill tag-pill-btn"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                navigate(`/feed?problem=${encodeURIComponent(tag)}`)
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Brand mention chip — when post has brand but no tagged product */}
      {post.brand && !product && (
        <Link
          to={`/brand/${brandSlug(post.brand)}`}
          className="post-brand-mention"
          onClick={(e) => e.stopPropagation()}
        >
          {post.brand}
        </Link>
      )}

      {/* Linked product */}
      {product ? (
        <Link to={`/product/${product.id}`} className="linked-product">
          <img src={product.heroImage} alt={product.name} />
          <div>
            <button
              type="button"
              className="linked-product-brand"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                navigate(`/brand/${brandSlug(product.brand)}`)
              }}
            >
              {product.brand}
            </button>
            <span>{product.name}</span>
          </div>
        </Link>
      ) : null}

      <div className="post-stats">
        <span><ThumbsUp size={14} /> {post.upvotes}</span>
        <span><MessageCircle size={14} /> {post.commentCount}</span>
      </div>
    </article>
  )
}
