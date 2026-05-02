import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { useComments, usePosts, useUsers } from '../hooks/useTiaraData'
import { demoUserId } from '../data/mockData'
import { formatDate } from '../lib/format'

type Tab = 'posts' | 'comments'

export function UserProfilePage() {
  const { userId = '' } = useParams()
  const navigate = useNavigate()
  const { data: users = [] } = useUsers()
  const { data: posts = [] } = usePosts()
  const { data: comments = [] } = useComments()
  const [tab, setTab] = useState<Tab>('posts')

  const user = users.find((u) => u.id === userId)

  if (!user) return <div className="empty-state">User not found.</div>

  // Redirect own profile to /profile
  if (userId === demoUserId) {
    navigate('/profile', { replace: true })
    return null
  }

  const userPosts = posts.filter((p) => p.authorId === userId)
  const userComments = comments.filter(
    (c) => c.authorId === userId && !c.body.startsWith('AI_SUMMARY'),
  )

  return (
    <div className="page-stack">
      {/* Hero */}
      <section className="profile-hero">
        <img src={user.avatar} alt={user.name} className="profile-avatar" />
        <div style={{ flex: 1 }}>
          <span className="section-kicker">@{user.username}</span>
          <h1>{user.name}</h1>
          <p>{user.bio}</p>
          <div className="profile-stats-row">
            <span><strong>{userPosts.length}</strong> posts</span>
            <span><strong>{userComments.length}</strong> comments</span>
            <span><strong>{user.karma}</strong> karma</span>
          </div>
          <div className="tag-row" style={{ marginTop: '10px' }}>
            {user.badges.map((b) => <span key={b} className="tag-pill">{b}</span>)}
          </div>
        </div>
        <button
          type="button"
          className="primary-button"
          onClick={() => navigate(`/inbox/${userId}`)}
        >
          <MessageCircle size={15} />
          Message
        </button>
      </section>

      {/* Skin profile */}
      <section className="details-grid">
        <article className="detail-card">
          <h3>Skin profile</h3>
          <p>{user.skinType} skin · {user.skinTone} tone</p>
          <div className="tag-row">
            {(user.skinConcerns as string[]).map((c) => (
              <span key={c} className="tag-pill">{c}</span>
            ))}
          </div>
        </article>
        <article className="detail-card">
          <h3>Hair profile</h3>
          <p>{user.hairType} hair</p>
          <div className="tag-row">
            {(user.hairConcerns as string[]).map((c) => (
              <span key={c} className="tag-pill">{c}</span>
            ))}
          </div>
        </article>
        <article className="detail-card">
          <h3>City</h3>
          <p>{user.city}</p>
        </article>
      </section>

      {/* Posts + Comments tabs */}
      <section className="section-block section-tight">
        <div className="profile-tabs">
          <button
            type="button"
            className={`profile-tab${tab === 'posts' ? ' profile-tab--active' : ''}`}
            onClick={() => setTab('posts')}
          >
            Posts <span className="profile-tab-count">{userPosts.length}</span>
          </button>
          <button
            type="button"
            className={`profile-tab${tab === 'comments' ? ' profile-tab--active' : ''}`}
            onClick={() => setTab('comments')}
          >
            Comments <span className="profile-tab-count">{userComments.length}</span>
          </button>
        </div>

        {tab === 'posts' && (
          <div className="feed-stack">
            {userPosts.length > 0 ? userPosts.map((post) => (
              <Link to={`/feed/${post.id}`} className="profile-activity-card" key={post.id}>
                <strong className="profile-activity-title">{post.title}</strong>
                <p className="profile-activity-body">{post.description}</p>
                <div className="profile-activity-meta">
                  <span>{formatDate(post.createdAt)}</span>
                  <span>&#8679; {post.upvotes}</span>
                  <span>&#9741; {post.commentCount}</span>
                </div>
              </Link>
            )) : (
              <p className="empty-label">No posts yet.</p>
            )}
          </div>
        )}

        {tab === 'comments' && (
          <div className="feed-stack">
            {userComments.length > 0 ? userComments.map((comment) => {
              const post = posts.find((p) => p.id === comment.postId)
              return (
                <Link to={`/feed/${comment.postId}`} className="profile-activity-card" key={comment.id}>
                  {post && <span className="profile-comment-context">on: {post.title}</span>}
                  <p className="profile-activity-body">{comment.body}</p>
                  <div className="profile-activity-meta">
                    <span>{formatDate(comment.createdAt)}</span>
                    <span>&#8679; {comment.upvotes}</span>
                  </div>
                </Link>
              )
            }) : (
              <p className="empty-label">No comments yet.</p>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
