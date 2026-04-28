import { useState } from 'react'
import type { FormEvent } from 'react'
import { MessageCircle, Send } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useComments, useCreateComment, usePost, useProducts, useUsers } from '../hooks/useTiaraData'
import { formatDate } from '../lib/format'
import { demoUserId } from '../data/mockData'

export function ThreadPage() {
  const { postId = '' } = useParams()
  const [draft, setDraft] = useState('')
  const { data: post } = usePost(postId)
  const { data: comments = [] } = useComments(postId)
  const { data: users = [] } = useUsers()
  const { data: products = [] } = useProducts()
  const createComment = useCreateComment()

  if (!post) {
    return <div className="empty-state">This thread could not be found.</div>
  }

  const author = users.find((user) => user.id === post.authorId)
  const product = products.find((item) => item.id === post.productId)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!draft.trim()) return

    createComment.mutate({
      postId,
      authorId: demoUserId,
      body: draft.trim(),
    })
    setDraft('')
  }

  return (
    <div className="page-stack">
      <article className="thread-hero">
        <div className="author-row">
          <img src={author?.avatar} alt={author?.name} className="avatar-sm" />
          <div>
            <div className="author-name">{author?.name}</div>
            <div className="meta-line">
              {post.type} · {formatDate(post.createdAt)}
            </div>
          </div>
        </div>
        <h1 className="thread-title">{post.title}</h1>
        <p className="thread-copy">{post.description}</p>
        <div className="tag-row">
          {post.tags.map((tag) => (
            <span key={tag} className="tag-pill">
              {tag}
            </span>
          ))}
        </div>
        {post.image ? <img src={post.image} alt={post.title} className="thread-image" /> : null}
        {product ? (
          <Link to={`/product/${product.id}`} className="thread-product-banner">
            <img src={product.heroImage} alt={product.name} />
            <div>
              <span className="section-kicker">Tagged product</span>
              <strong>{product.brand}</strong>
              <p>{product.name}</p>
            </div>
          </Link>
        ) : null}
      </article>

      <section className="section-block section-tight">
        <div className="section-head">
          <div>
            <span className="section-kicker">Comments</span>
            <h2>{comments.length} people weighed in</h2>
          </div>
          <div className="thread-count">
            <MessageCircle size={15} />
            {post.commentCount}
          </div>
        </div>
        <form className="comment-form" onSubmit={handleSubmit}>
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Add your take, routine tip, or wear-test note..."
            rows={4}
          />
          <button type="submit" className="primary-button">
            <Send size={15} />
            Reply
          </button>
        </form>
      </section>

      <div className="comment-list">
        {comments.map((comment) => {
          const commentAuthor = users.find((user) => user.id === comment.authorId)
          return (
            <article key={comment.id} className="comment-card">
              <div className="author-row">
                <img src={commentAuthor?.avatar} alt={commentAuthor?.name} className="avatar-sm" />
                <div>
                  <div className="author-name">{commentAuthor?.name}</div>
                  <div className="meta-line">{formatDate(comment.createdAt)}</div>
                </div>
              </div>
              <p>{comment.body}</p>
            </article>
          )
        })}
      </div>
    </div>
  )
}
