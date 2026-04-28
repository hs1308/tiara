import { ArrowRight, MessageCircle, ShoppingBag } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PostCard } from '../components/ui/PostCard'
import { useAddToCart, usePosts, useProduct, useUsers } from '../hooks/useTiaraData'
import { formatCurrency } from '../lib/format'

export function ProductPage() {
  const { productId = '' } = useParams()
  const navigate = useNavigate()
  const { data: product } = useProduct(productId)
  const { data: posts = [] } = usePosts()
  const { data: users = [] } = useUsers()
  const addToCart = useAddToCart()

  if (!product) {
    return <div className="empty-state">We could not find that product.</div>
  }

  const relatedPosts = posts.filter((post) => post.productId === product.id).slice(0, 3)

  return (
    <div className="page-stack">
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
          <span className="section-kicker">{product.brand}</span>
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
              onClick={() => navigate(`/create?productId=${product.id}&type=Product%20Talk`)}
            >
              <MessageCircle size={15} />
              Ask the community
            </button>
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="section-head">
          <div>
            <span className="section-kicker">What the community is saying</span>
            <h2>Social proof, context, and the nuanced bits that star ratings miss</h2>
          </div>
          <Link to="/feed" className="inline-link">
            See all discussions <ArrowRight size={15} />
          </Link>
        </div>
        <div className="snapshot-panel">
          <div className="snapshot-stat">
            <strong>{product.communityScore}/10</strong>
            <span>Community score</span>
          </div>
          <div className="snapshot-stat">
            <strong>78%</strong>
            <span>Positive sentiment</span>
          </div>
          <div className="snapshot-stat">
            <strong>{product.discussionCount}</strong>
            <span>Posts and comments</span>
          </div>
        </div>
        <div className="tag-row">
          {product.tags.map((tag) => (
            <span key={tag} className="tag-pill">
              {tag}
            </span>
          ))}
        </div>
        <div className="feed-stack">
          {relatedPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              author={users.find((user) => user.id === post.authorId)}
              product={product}
              compact
            />
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="section-head">
          <div>
            <span className="section-kicker">Product details</span>
            <h2>Ingredients, usage, and suitability for your profile</h2>
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
    </div>
  )
}
