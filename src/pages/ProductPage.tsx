import { ArrowRight, MessageCircle, ShoppingBag } from 'lucide-react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { PostCard } from '../components/ui/PostCard'
import { useAddToCart, usePosts, useProduct, useProducts, useUsers } from '../hooks/useTiaraData'
import { formatCurrency } from '../lib/format'
import type { Product } from '../types'

function uniqueProducts(products: Product[]) {
  return products.filter(
    (product, index, list) => list.findIndex((item) => item.id === product.id) === index,
  )
}

function fillProductRail(primary: Product[], fallback: Product[], currentProductId: string, limit = 4) {
  return uniqueProducts([...primary, ...fallback])
    .filter((product) => product.id !== currentProductId)
    .slice(0, limit)
}

export function ProductPage() {
  const { productId = '' } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { data: product } = useProduct(productId)
  const { data: posts = [] } = usePosts()
  const { data: users = [] } = useUsers()
  const { data: allProducts = [] } = useProducts()
  const addToCart = useAddToCart()

  if (!product) {
    return <div className="empty-state">We could not find that product.</div>
  }

  const relatedPosts = posts.filter((post) => post.productId === product.id).slice(0, 3)
  const brandMatches = allProducts.filter((p) => p.brand === product.brand && p.id !== product.id)
  const categoryMatches = allProducts.filter((p) => p.category === product.category && p.id !== product.id)
  const otherProducts = allProducts.filter((p) => p.id !== product.id)
  const moreFromBrand = fillProductRail(brandMatches, [...categoryMatches, ...otherProducts], product.id)
  const similarProducts = fillProductRail(
    categoryMatches.filter((p) => p.brand !== product.brand),
    otherProducts,
    product.id,
  )

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
          <Link to={`/brand/${encodeURIComponent(product.brand)}`} className="section-kicker brand-link">{product.brand}</Link>
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

      <section className="section-block">
        <div className="section-head">
          <div>
            <span className="section-kicker">What the community is saying</span>
            <h2>Social proof, context, and the nuanced bits that star ratings miss</h2>
          </div>
          <Link to={`/feed?product=${product.id}`} className="inline-link">
            See all discussions <ArrowRight size={15} />
          </Link>
        </div>
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

      <section className="section-block">
          <div className="section-head">
            <div>
              <span className="section-kicker">More from this brand</span>
              <h2>
                {brandMatches.length
                  ? `Other ${product.brand} products on Tiara`
                  : `Products shoppers compare with ${product.brand}`}
              </h2>
            </div>
            <Link to={`/brand/${encodeURIComponent(product.brand)}`} className="inline-link">
              View brand <ArrowRight size={15} />
            </Link>
          </div>
          <div className="product-rail">
            {moreFromBrand.map((p) => (
              <Link key={p.id} to={`/product/${p.id}`} className="mini-product-card">
                <img src={p.heroImage} alt={p.name} className="mini-product-image" />
                <div className="mini-product-info">
                  <span className="mini-product-name">{p.name}</span>
                  <span className="mini-product-price">{formatCurrency(p.price)}</span>
                  <span className="mini-product-meta">★ {p.rating} · ◈ {p.communityScore}/10</span>
                </div>
              </Link>
            ))}
            {!moreFromBrand.length ? <p className="empty-label">More products will appear here as the catalog grows.</p> : null}
          </div>
        </section>

      <section className="section-block">
          <div className="section-head">
            <div>
              <span className="section-kicker">Similar products</span>
              <h2>{categoryMatches.length ? `From other brands in ${product.category}` : 'More community-backed picks'}</h2>
            </div>
          </div>
          <div className="product-rail">
            {similarProducts.map((p) => (
              <Link key={p.id} to={`/product/${p.id}`} className="mini-product-card">
                <img src={p.heroImage} alt={p.name} className="mini-product-image" />
                <div className="mini-product-info">
                  <span className="mini-product-name">{p.name}</span>
                  <span className="mini-product-eyebrow">{p.brand}</span>
                  <span className="mini-product-price">{formatCurrency(p.price)}</span>
                  <span className="mini-product-meta">★ {p.rating} · ◈ {p.communityScore}/10</span>
                </div>
              </Link>
            ))}
            {!similarProducts.length ? <p className="empty-label">Similar products will appear here as the catalog grows.</p> : null}
          </div>
        </section>
    </div>
  )
}
