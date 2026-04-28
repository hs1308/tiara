import { Link } from 'react-router-dom'
import { useCurrentUser, usePosts } from '../hooks/useTiaraData'

export function ProfilePage() {
  const { data: user } = useCurrentUser()
  const { data: posts = [] } = usePosts()
  const myPosts = posts.filter((post) => post.authorId === user?.id)

  if (!user) {
    return <div className="empty-state">Profile unavailable.</div>
  }

  return (
    <div className="page-stack">
      <section className="profile-hero">
        <img src={user.avatar} alt={user.name} className="profile-avatar" />
        <div>
          <span className="section-kicker">@{user.username}</span>
          <h1>{user.name}</h1>
          <p>{user.bio}</p>
        </div>
      </section>
      <section className="details-grid">
        <article className="detail-card">
          <h3>Skin profile</h3>
          <p>
            {user.skinType} skin · {user.skinTone} tone
          </p>
          <div className="tag-row">
            {user.skinConcerns.map((concern) => (
              <span key={concern} className="tag-pill">
                {concern}
              </span>
            ))}
          </div>
        </article>
        <article className="detail-card">
          <h3>Hair profile</h3>
          <p>{user.hairType} hair</p>
          <div className="tag-row">
            {user.hairConcerns.map((concern) => (
              <span key={concern} className="tag-pill">
                {concern}
              </span>
            ))}
          </div>
        </article>
        <article className="detail-card">
          <h3>Badges</h3>
          <div className="tag-row">
            {user.badges.map((badge) => (
              <span key={badge} className="tag-pill">
                {badge}
              </span>
            ))}
          </div>
        </article>
      </section>
      <section className="section-block section-tight">
        <div className="section-head">
          <div>
            <span className="section-kicker">Your activity</span>
            <h2>{myPosts.length} posts shaping product trust on Tiara</h2>
          </div>
        </div>
        <div className="feed-stack">
          {myPosts.map((post) => (
            <Link to={`/feed/${post.id}`} className="comment-card" key={post.id}>
              <strong>{post.title}</strong>
              <span className="meta-line">{post.type}</span>
              <p>{post.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
