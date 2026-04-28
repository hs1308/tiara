import { Sparkles, TrendingUp } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { PostCard } from '../components/ui/PostCard'
import { ProductCard } from '../components/ui/ProductCard'
import { useAddToCart, useCurrentUser, usePosts, useProducts, useUsers } from '../hooks/useTiaraData'
import { formatCompact } from '../lib/format'

export function HomePage() {
  const navigate = useNavigate()
  const { data: user } = useCurrentUser()
  const { data: users = [] } = useUsers()
  const { data: products = [] } = useProducts()
  const { data: posts = [] } = usePosts()
  const addToCart = useAddToCart()

  const featuredProducts = products.slice(0, 3)
  const livePosts = posts.slice(0, 3)

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="hero-kicker">Community-led beauty commerce</span>
          <h1>{user ? `Hi ${user.name.split(' ')[0]}, the community already did the homework.` : 'Tiara'}</h1>
          <p>
            Today&apos;s picks blend what works in your city, what the community is buying,
            and what keeps showing up in honest product conversations.
          </p>
          <div className="hero-actions">
            <button type="button" className="primary-button large" onClick={() => navigate('/shop')}>
              Shop the edit
            </button>
            <button type="button" className="secondary-button large" onClick={() => navigate('/feed')}>
              Open live discussions
            </button>
          </div>
        </div>
        <div className="hero-aside">
          <div className="stat-card">
            <Sparkles size={16} />
            <strong>Humidity proof shortlist</strong>
            <span>Mumbai-ready sunscreens, dewy base products, and soft-finish lip care.</span>
          </div>
          <div className="stat-card">
            <TrendingUp size={16} />
            <strong>{formatCompact(posts.reduce((sum, post) => sum + post.upvotes, 0))} trust signals</strong>
            <span>Posts, comments, and saves turning discovery into decisions.</span>
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="section-head">
          <div>
            <span className="section-kicker">The community is obsessing over</span>
            <h2>Premium picks with social proof built in</h2>
          </div>
          <Link to="/shop" className="inline-link">
            See all
          </Link>
        </div>
        <div className="product-grid">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={(productId) => addToCart.mutate(productId)}
            />
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="section-head">
          <div>
            <span className="section-kicker">Live discussions</span>
            <h2>Where validation, routines, and real-world wear tests happen</h2>
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
        <button type="button" className="primary-button" onClick={() => navigate('/profile')}>
          Review profile
        </button>
      </section>
    </div>
  )
}
