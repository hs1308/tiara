import { ArrowUpRight, MessageCircle, ThumbsUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatDate } from '../../lib/format'
import type { Post, Product, UserProfile } from '../../types'

interface PostCardProps {
  post: Post
  author?: UserProfile
  product?: Product | null
  compact?: boolean
}

export function PostCard({ post, author, product, compact }: PostCardProps) {
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
      <p className="post-description">{post.description}</p>
      {post.image ? <img src={post.image} alt={post.title} className="post-image" /> : null}
      <div className="tag-row">
        {post.tags.map((tag) => (
          <span key={tag} className="tag-pill">
            {tag}
          </span>
        ))}
      </div>
      {product ? (
        <Link to={`/product/${product.id}`} className="linked-product">
          <img src={product.heroImage} alt={product.name} />
          <div>
            <strong>{product.brand}</strong>
            <span>{product.name}</span>
          </div>
        </Link>
      ) : null}
      <div className="post-stats">
        <span>
          <ThumbsUp size={14} /> {post.upvotes}
        </span>
        <span>
          <MessageCircle size={14} /> {post.commentCount}
        </span>
      </div>
    </article>
  )
}
