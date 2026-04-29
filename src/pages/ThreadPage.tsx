import { useMemo, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import {
  AtSign,
  ChevronDown,
  ChevronRight,
  CornerDownRight,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Send,
  ShoppingBag,
  ThumbsUp,
  Trash2,
} from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { demoUserId } from '../data/mockData'
import {
  useBrands,
  useComments,
  useCreateComment,
  useMentionSearch,
  usePost,
  useProducts,
  useUpvoteComment,
  useUsers,
} from '../hooks/useTiaraData'
import { formatDate } from '../lib/format'
import { brandSlug } from '../lib/utils'
import type { Brand, Comment, Product } from '../types'

interface ThreadedComment extends Comment {
  children: ThreadedComment[]
}

function buildCommentTree(comments: Comment[]) {
  const map = new Map<string, ThreadedComment>()
  const roots: ThreadedComment[] = []

  comments.forEach((comment) => {
    map.set(comment.id, { ...comment, children: [] })
  })

  map.forEach((comment) => {
    if (comment.parentId) {
      const parent = map.get(comment.parentId)
      if (parent) {
        parent.children.push(comment)
        return
      }
    }
    roots.push(comment)
  })

  // Pin AI summary to top
  roots.sort((a, b) => {
    if (a.body.startsWith('AI_SUMMARY:')) return -1
    if (b.body.startsWith('AI_SUMMARY:')) return 1
    return 0
  })

  return roots
}

// ── Mention link renderer ─────────────────────────────────────────────────────

interface MentionEntity {
  name: string
  to: string
  type: 'brand' | 'product'
}

function renderCommentBody(body: string, products: Product[], brands: Brand[]): ReactNode[] {
  const productBrands = [...new Set(products.map((product) => product.brand))]
  const brandEntities = [
    ...brands.map((brand) => brand.name),
    ...productBrands,
  ].filter((name, index, list) => list.indexOf(name) === index)

  const entities: MentionEntity[] = [
    ...brandEntities.map((name) => ({
      name,
      to: `/brand/${brandSlug(name)}`,
      type: 'brand' as const,
    })),
    ...products.map((p) => ({ name: p.name, to: `/product/${p.id}`, type: 'product' as const })),
  ].sort((a, b) => b.name.length - a.name.length) // longest first to avoid partial matches

  const nodes: ReactNode[] = []
  let remaining = body
  let key = 0

  while (remaining.length > 0) {
    const atIdx = remaining.indexOf('@')
    if (atIdx === -1) {
      nodes.push(remaining)
      break
    }
    if (atIdx > 0) {
      nodes.push(remaining.slice(0, atIdx))
      remaining = remaining.slice(atIdx)
    }
    const afterAt = remaining.slice(1)
    const match = entities.find((e) => afterAt.startsWith(e.name))
    if (match) {
      nodes.push(
        <Link
          key={key++}
          to={match.to}
          className={`mention-link${match.type === 'brand' ? ' mention-link-brand' : ''}`}
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

// ── Mention-aware textarea ────────────────────────────────────────────────────

interface MentionResult {
  id: string
  label: string
  sublabel?: string
  type: 'brand' | 'product'
}

interface ActiveMention {
  query: string
  atIndex: number
}

interface MentionTextareaProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  className?: string
  autoFocus?: boolean
}

function MentionTextarea({ value, onChange, placeholder, rows = 2, className, autoFocus }: MentionTextareaProps) {
  const [activeMention, setActiveMention] = useState<ActiveMention | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { data: mentionResults = [] } = useMentionSearch(activeMention ? activeMention.query : null)

  function detectMention(text: string, cursorPos: number) {
    const before = text.slice(0, cursorPos)
    const match = before.match(/@(\w*)$/)
    if (match) {
      setActiveMention({ query: match[1], atIndex: before.length - match[0].length })
    } else {
      setActiveMention(null)
    }
  }

  function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const text = event.target.value
    onChange(text)
    detectMention(text, event.target.selectionStart ?? text.length)
  }

  function handleKeyUp(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Escape') {
      setActiveMention(null)
      return
    }
    const el = event.currentTarget
    detectMention(el.value, el.selectionStart ?? el.value.length)
  }

  function selectMention(item: MentionResult) {
    if (!activeMention) return
    const before = value.slice(0, activeMention.atIndex)
    // slice from after the @ + existing query text
    const after = value.slice(activeMention.atIndex + 1 + activeMention.query.length)
    const inserted = `@${item.label} `
    const next = before + inserted + after
    onChange(next)
    setActiveMention(null)
    // restore focus and place cursor after the inserted mention
    setTimeout(() => {
      const el = textareaRef.current
      if (!el) return
      el.focus()
      const pos = before.length + inserted.length
      el.setSelectionRange(pos, pos)
    }, 0)
  }

  const showDropdown = activeMention !== null && mentionResults.length > 0

  return (
    <div className="mention-wrap">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyUp={handleKeyUp}
        onBlur={() => setTimeout(() => setActiveMention(null), 150)}
        placeholder={placeholder}
        rows={rows}
        className={className}
        autoFocus={autoFocus}
      />
      {showDropdown && (
        <div className="mention-dropdown" role="listbox">
          {(mentionResults as MentionResult[]).map((item) => (
            <button
              key={`${item.type}-${item.id}`}
              type="button"
              role="option"
              className="mention-item"
              onMouseDown={(e) => {
                e.preventDefault()
                selectMention(item)
              }}
            >
              <span className="mention-item-icon">
                {item.type === 'brand' ? <AtSign size={13} /> : <ShoppingBag size={13} />}
              </span>
              <span className="mention-item-body">
                <span className="mention-item-label">{item.label}</span>
                {item.sublabel ? <span className="mention-item-sub">{item.sublabel}</span> : null}
              </span>
              <span className={`mention-item-badge mention-badge-${item.type}`}>{item.type}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── CommentNode ───────────────────────────────────────────────────────────────

interface CommentNodeProps {
  comment: ThreadedComment
  level?: number
  collapsedIds: Set<string>
  activeReplyId: string | null
  replyDraft: string
  isReplying: boolean
  editingCommentId: string | null
  editDraft: string
  onReplyDraftChange: (value: string) => void
  onReplySubmit: (event: FormEvent<HTMLFormElement>, commentId: string) => void
  onToggleCollapse: (commentId: string) => void
  onReply: (commentId: string) => void
  onCancelReply: () => void
  onUpvote: (commentId: string) => void
  onEditStart: (commentId: string, body: string) => void
  onEditDraftChange: (value: string) => void
  onEditSubmit: (commentId: string) => void
  onEditCancel: () => void
  onDelete: (commentId: string) => void
  users: Array<{ id: string; name: string; username: string; avatar: string }>
  products: Product[]
  brands: Brand[]
}

function CommentNode({
  comment,
  level = 0,
  collapsedIds,
  activeReplyId,
  replyDraft,
  isReplying,
  editingCommentId,
  editDraft,
  onReplyDraftChange,
  onReplySubmit,
  onToggleCollapse,
  onReply,
  onCancelReply,
  onUpvote,
  onEditStart,
  onEditDraftChange,
  onEditSubmit,
  onEditCancel,
  onDelete,
  users,
  products,
  brands,
}: CommentNodeProps) {
  const author = users.find((user) => user.id === comment.authorId)
  const isCollapsed = collapsedIds.has(comment.id)
  const hasChildren = comment.children.length > 0
  const isReplyTarget = activeReplyId === comment.id
  const isOwn = comment.authorId === demoUserId
  const isEditing = editingCommentId === comment.id
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="thread-node" style={{ '--thread-level': level } as React.CSSProperties}>
      <div className="thread-node-rail">
        {hasChildren ? (
          <button
            type="button"
            className="collapse-toggle"
            onClick={() => onToggleCollapse(comment.id)}
            aria-label={isCollapsed ? 'Expand thread' : 'Collapse thread'}
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
          </button>
        ) : (
          <span className="collapse-spacer"></span>
        )}
        <span className="thread-line"></span>
      </div>

      <div className="thread-content">
        <article className={`thread-comment${comment.body.startsWith('AI_SUMMARY:') ? ' ai-summary-comment' : ''}`}>
          <div className="author-row">
            <img src={author?.avatar} alt={author?.name} className="avatar-sm" />
            <div style={{ flex: 1 }}>
              <div className="author-name">
                {comment.body.startsWith('AI_SUMMARY:')
                  ? <span className="ai-summary-label">✦ AI Summary</span>
                  : author?.name}
              </div>
              <div className="meta-line">
                {comment.body.startsWith('AI_SUMMARY:') ? 'Auto-generated from community responses' : `@${author?.username} · ${formatDate(comment.createdAt)}`}
              </div>
            </div>
            {isOwn && (
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  className="thread-action-button"
                  onClick={() => setShowMenu((s) => !s)}
                  aria-label="More options"
                >
                  <MoreHorizontal size={15} />
                </button>
                {showMenu && (
                  <div className="comment-menu">
                    <button
                      type="button"
                      className="comment-menu-item"
                      onClick={() => { onEditStart(comment.id, comment.body); setShowMenu(false) }}
                    >
                      <Pencil size={13} /> Edit
                    </button>
                    <button
                      type="button"
                      className="comment-menu-item comment-menu-danger"
                      onClick={() => { onDelete(comment.id); setShowMenu(false) }}
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {isEditing ? (
            <div style={{ display: 'grid', gap: '10px' }}>
              <MentionTextarea
                value={editDraft}
                onChange={onEditDraftChange}
                placeholder="Edit your comment…"
                rows={3}
                className="inline-reply-textarea"
                autoFocus
              />
              <div className="inline-reply-actions">
                <button type="button" className="secondary-button" onClick={onEditCancel}>Cancel</button>
                <button
                  type="button"
                  className="primary-button comment-submit"
                  onClick={() => onEditSubmit(comment.id)}
                  disabled={!editDraft.trim()}
                >
                  <Send size={15} /> Save
                </button>
              </div>
            </div>
          ) : comment.body.startsWith('AI_SUMMARY:') ? (
            <div>
              <ul className="ai-summary-list">
                {comment.body
                  .replace('AI_SUMMARY:', '')
                  .split('•')
                  .filter(Boolean)
                  .map((point, i) => <li key={i}>{point.trim()}</li>)}
              </ul>
            </div>
          ) : (
            <p>{renderCommentBody(comment.body, products, brands)}</p>
          )}

          <div className="thread-actions">
            <button
              type="button"
              className="thread-action-button"
              onClick={() => onUpvote(comment.id)}
            >
              <ThumbsUp size={14} />
              {comment.upvotes}
            </button>
            <button
              type="button"
              className="thread-action-button"
              onClick={() => onReply(comment.id)}
            >
              <CornerDownRight size={14} />
              Reply
            </button>
          </div>
        </article>

        {/* Reply form nested directly below this comment */}
        {isReplyTarget ? (
          <form
            className="inline-reply-form"
            onSubmit={(event) => onReplySubmit(event, comment.id)}
          >
            <MentionTextarea
              value={replyDraft}
              onChange={onReplyDraftChange}
              placeholder={`Reply to ${author?.name ?? 'this comment'}… (type @ to tag a brand or product)`}
              rows={2}
              className="inline-reply-textarea"
              autoFocus
            />
            <div className="inline-reply-actions">
              <button type="button" className="secondary-button" onClick={onCancelReply}>
                Cancel
              </button>
              <button
                type="submit"
                className="primary-button comment-submit"
                disabled={isReplying || !replyDraft.trim()}
              >
                <Send size={15} />
                {isReplying ? 'Replying…' : 'Reply'}
              </button>
            </div>
          </form>
        ) : null}

        {/* Children nested below, indented */}
        {hasChildren && !isCollapsed ? (
          <div className="thread-children">
            {comment.children.map((child) => (
              <CommentNode
                key={child.id}
                comment={child}
                level={level + 1}
                collapsedIds={collapsedIds}
                activeReplyId={activeReplyId}
                replyDraft={replyDraft}
                isReplying={isReplying}
                editingCommentId={editingCommentId}
                editDraft={editDraft}
                onReplyDraftChange={onReplyDraftChange}
                onReplySubmit={onReplySubmit}
                onToggleCollapse={onToggleCollapse}
                onReply={onReply}
                onCancelReply={onCancelReply}
                onUpvote={onUpvote}
                onEditStart={onEditStart}
                onEditDraftChange={onEditDraftChange}
                onEditSubmit={onEditSubmit}
                onEditCancel={onEditCancel}
                onDelete={onDelete}
                users={users}
                products={products}
                brands={brands}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}

// ── ThreadPage ────────────────────────────────────────────────────────────────

export function ThreadPage() {
  const { postId = '' } = useParams()
  const navigate = useNavigate()
  const [draft, setDraft] = useState('')
  const [replyDraft, setReplyDraft] = useState('')
  const [replyTargetId, setReplyTargetId] = useState<string | null>(null)
  const [collapsedIds, setCollapsedIds] = useState<string[]>([])
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState('')
  const [localComments, setLocalComments] = useState<Comment[] | null>(null)
  const { data: post, refetch: refetchPost } = usePost(postId)
  const { data: comments = [] } = useComments(postId)
  const { data: users = [] } = useUsers()
  const { data: products = [] } = useProducts()
  const { data: brands = [] } = useBrands()
  const createComment = useCreateComment()
  const upvoteComment = useUpvoteComment()

  const displayComments = localComments ?? comments
  const commentTree = useMemo(() => buildCommentTree(displayComments), [displayComments])
  const collapsedSet = useMemo(() => new Set(collapsedIds), [collapsedIds])

  if (!post) {
    return <div className="empty-state">This thread could not be found.</div>
  }

  const author = users.find((user) => user.id === post.authorId)
  const product = products.find((item) => item.id === post.productId)
  const isOwnPost = post.authorId === demoUserId

  function submitTopLevelComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!draft.trim()) return
    createComment.mutate({ postId, authorId: demoUserId, body: draft.trim(), parentId: null })
    setDraft('')
  }

  function submitReply(event: FormEvent<HTMLFormElement>, parentId: string) {
    event.preventDefault()
    if (!replyDraft.trim()) return
    createComment.mutate(
      { postId, authorId: demoUserId, body: replyDraft.trim(), parentId },
      { onSuccess: () => { setReplyDraft(''); setReplyTargetId(null) } },
    )
  }

  function toggleCollapse(commentId: string) {
    setCollapsedIds((current) =>
      current.includes(commentId)
        ? current.filter((id) => id !== commentId)
        : [...current, commentId],
    )
  }

  function handleEditStart(commentId: string, body: string) {
    setEditingCommentId(commentId)
    setEditDraft(body)
  }

  function handleEditSubmit(commentId: string) {
    if (!editDraft.trim()) return
    setLocalComments((prev) => {
      const base = prev ?? comments
      return base.map((c) => c.id === commentId ? { ...c, body: editDraft.trim() } : c)
    })
    setEditingCommentId(null)
    setEditDraft('')
  }

  function handleEditCancel() {
    setEditingCommentId(null)
    setEditDraft('')
  }

  function handleDeleteComment(commentId: string) {
    setLocalComments((prev) => {
      const base = prev ?? comments
      return base.filter((c) => c.id !== commentId)
    })
  }

  return (
    <div className="page-stack">
      <article className="thread-hero">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div className="author-row">
            <img src={author?.avatar} alt={author?.name} className="avatar-sm" />
            <div>
              <div className="author-name">{author?.name}</div>
              <div className="meta-line">
                {post.type} · {formatDate(post.createdAt)}
              </div>
            </div>
          </div>
          {isOwnPost && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="thread-action-button"
                title="Delete post"
                onClick={() => { if (window.confirm('Delete this post?')) navigate('/feed') }}
              >
                <Trash2 size={15} />
              </button>
            </div>
          )}
        </div>
        <h2 className="thread-title">{post.title}</h2>
        <p className="thread-copy">{post.description}</p>
        <div className="tag-row">
          {post.tags.map((tag) => (
            <Link key={tag} to={`/feed?problem=${encodeURIComponent(tag)}`} className="tag-pill tag-pill-btn">
              {tag}
            </Link>
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
            <h2>{displayComments.length} people weighed in</h2>
          </div>
          <div className="thread-count">
            <MessageCircle size={15} />
            {post.commentCount}
          </div>
        </div>
        <form className="comment-form-inline" onSubmit={submitTopLevelComment}>
          <MentionTextarea
            value={draft}
            onChange={setDraft}
            placeholder="Add a comment… (type @ to tag a brand or product)"
            rows={2}
            className="comment-form-inline-textarea"
          />
          <button
            type="submit"
            className="primary-button comment-submit"
            disabled={createComment.isPending || !draft.trim()}
          >
            <Send size={15} />
            Comment
          </button>
        </form>
        {createComment.error ? (
          <div className="form-error">Could not save comment. Please try again.</div>
        ) : null}
      </section>

      <div className="thread-tree">
        {commentTree.map((comment) => (
          <CommentNode
            key={comment.id}
            comment={comment}
            collapsedIds={collapsedSet}
            activeReplyId={replyTargetId}
            replyDraft={replyDraft}
            isReplying={createComment.isPending}
            editingCommentId={editingCommentId}
            editDraft={editDraft}
            onReplyDraftChange={setReplyDraft}
            onReplySubmit={submitReply}
            onToggleCollapse={toggleCollapse}
            onReply={(commentId) => { setReplyTargetId(commentId); setReplyDraft('') }}
            onCancelReply={() => { setReplyTargetId(null); setReplyDraft('') }}
            onUpvote={(commentId) => upvoteComment.mutate({ commentId, postId })}
            onEditStart={handleEditStart}
            onEditDraftChange={setEditDraft}
            onEditSubmit={handleEditSubmit}
            onEditCancel={handleEditCancel}
            onDelete={handleDeleteComment}
            users={users}
            products={products}
            brands={brands}
          />
        ))}
      </div>
    </div>
  )
}
