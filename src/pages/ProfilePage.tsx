import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaceScanModal, SCAN_RESULTS } from '../components/ui/FaceScanModal'
import { useCurrentUser, usePosts } from '../hooks/useTiaraData'

export function ProfilePage() {
  const { data: user } = useCurrentUser()
  const { data: posts = [] } = usePosts()
  const [showFaceScan, setShowFaceScan] = useState(false)
  const [scanApplied, setScanApplied] = useState(false)
  const myPosts = posts.filter((post) => post.authorId === user?.id)

  const skinType = scanApplied ? SCAN_RESULTS.skinType : user?.skinType ?? ''
  const skinTone = scanApplied ? SCAN_RESULTS.skinTone : user?.skinTone ?? ''
  const skinConcerns = scanApplied ? SCAN_RESULTS.skinConcerns : user?.skinConcerns ?? []
  const hairType = scanApplied ? SCAN_RESULTS.hairType : user?.hairType ?? ''
  const hairConcerns = scanApplied ? SCAN_RESULTS.hairConcerns : user?.hairConcerns ?? []

  if (!user) {
    return <div className="empty-state">Profile unavailable.</div>
  }

  return (
    <div className="page-stack">
      <section className="profile-hero">
        <img src={user.avatar} alt={user.name} className="profile-avatar" />
        <div style={{ flex: 1 }}>
          <span className="section-kicker">@{user.username}</span>
          <h1>{user.name}</h1>
          <p>{user.bio}</p>
        </div>
        <button type="button" className="secondary-button" onClick={() => setShowFaceScan(true)}>
          Analyse Face
        </button>
      </section>
      <section className="details-grid">
        <article className="detail-card">
          <h3>Skin profile</h3>
          <p>{skinType} skin · {skinTone} tone</p>
          <div className="tag-row">
            {skinConcerns.map((concern) => (
              <span key={concern} className="tag-pill">{concern}</span>
            ))}
          </div>
        </article>
        <article className="detail-card">
          <h3>Hair profile</h3>
          <p>{hairType} hair</p>
          <div className="tag-row">
            {hairConcerns.map((concern) => (
              <span key={concern} className="tag-pill">{concern}</span>
            ))}
          </div>
        </article>
        <article className="detail-card">
          <h3>Badges</h3>
          <div className="tag-row">
            {user.badges.map((badge) => (
              <span key={badge} className="tag-pill">{badge}</span>
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

      {showFaceScan && (
        <FaceScanModal
          onClose={() => setShowFaceScan(false)}
          onComplete={() => {
            setScanApplied(true)
            setShowFaceScan(false)
          }}
        />
      )}
    </div>
  )
}
