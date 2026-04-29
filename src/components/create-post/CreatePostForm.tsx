import { useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import { demoUserId } from '../../data/mockData'
import { useCreatePost, useMentionSearch, useProducts } from '../../hooks/useTiaraData'
import type { PostType } from '../../types'

const postTypes: PostType[] = [
  'Product Talk',
  'Skin & Hair Help',
  'Rec Request',
  'Routine Check',
  'Look & Feel',
]

interface CreatePostFormProps {
  productId?: string | null
  defaultType?: PostType
  modal?: boolean
  onSuccess?: (postId: string) => void
  onCancel?: () => void
}

export function CreatePostForm({
  productId,
  defaultType = 'Product Talk',
  modal,
  onSuccess,
  onCancel,
}: CreatePostFormProps) {
  const { data: products = [] } = useProducts()
  const createPost = useCreatePost()
  const linkedProduct = products.find((product) => product.id === productId)

  const [type, setType] = useState<PostType>(defaultType)
  const [title, setTitle] = useState(
    linkedProduct ? `Thoughts on ${linkedProduct.brand} ${linkedProduct.name}?` : '',
  )
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState(linkedProduct ? linkedProduct.tags.slice(0, 2).join(', ') : '')

  // @ mention state
  const [mentionQuery, setMentionQuery] = useState<string | null>(null)
  const [mentionStart, setMentionStart] = useState<number>(-1)
  const descRef = useRef<HTMLTextAreaElement>(null)

  const { data: mentionResults = [] } = useMentionSearch(mentionQuery)

  function handleDescriptionChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value
    setDescription(val)

    const cursor = e.target.selectionStart ?? val.length
    // Find the @ that is closest before the cursor with no spaces after it
    const textUpToCursor = val.slice(0, cursor)
    const atIndex = textUpToCursor.lastIndexOf('@')
    if (atIndex !== -1) {
      const queryText = textUpToCursor.slice(atIndex + 1)
      if (!queryText.includes(' ')) {
        setMentionQuery(queryText)
        setMentionStart(atIndex)
        return
      }
    }
    setMentionQuery(null)
    setMentionStart(-1)
  }

  function handleDescriptionKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (mentionQuery !== null && e.key === 'Escape') {
      setMentionQuery(null)
    }
  }

  function insertMention(label: string) {
    if (mentionStart === -1 || !descRef.current) return
    const cursor = descRef.current.selectionStart ?? description.length
    const before = description.slice(0, mentionStart)
    const after = description.slice(cursor)
    const inserted = `@${label} `
    const next = before + inserted + after
    setDescription(next)
    setMentionQuery(null)
    setMentionStart(-1)
    // Restore focus and cursor
    setTimeout(() => {
      if (descRef.current) {
        const pos = before.length + inserted.length
        descRef.current.focus()
        descRef.current.setSelectionRange(pos, pos)
      }
    }, 0)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextPost = await createPost.mutateAsync({
      authorId: demoUserId,
      productId: linkedProduct?.id ?? null,
      brand: linkedProduct?.brand ?? null,
      type,
      title,
      description,
      image: linkedProduct?.heroImage ?? null,
      tags: tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    })
    onSuccess?.(nextPost.id)
  }

  return (
    <form className="page-stack" onSubmit={handleSubmit}>
      <section className={`section-block section-tight${modal ? ' modal-section' : ''}`}>
        <div className="section-head">
          <div>
            <span className="section-kicker">Create post</span>
            <h2>Share your experience with the community</h2>
          </div>
          {modal ? (
            <button type="button" className="secondary-button" onClick={onCancel}>
              Close
            </button>
          ) : null}
        </div>
        <div className="checkout-grid">
          <label className="field">
            <span>Post type</span>
            <select value={type} onChange={(event) => setType(event.target.value as PostType)}>
              {postTypes.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Linked product</span>
            <input value={linkedProduct ? `${linkedProduct.brand} · ${linkedProduct.name}` : 'None'} readOnly />
          </label>
        </div>
        <label className="field">
          <span>Title</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} required />
        </label>

        {/* Description with @ mention */}
        <div className="field">
          <span>Description</span>
          <div className="mention-wrap">
            <textarea
              ref={descRef}
              className="comment-form-inline-textarea"
              value={description}
              onChange={handleDescriptionChange}
              onKeyDown={handleDescriptionKeyDown}
              rows={6}
              placeholder="What worked, what surprised you? Use @brand or @product to tag something."
              required
            />
            {mentionQuery !== null && mentionResults.length > 0 && (
              <div className="mention-dropdown">
                {mentionResults.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="mention-item"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      insertMention(item.label)
                    }}
                  >
                    <span className="mention-item-icon">
                      {item.type === 'brand' ? '🏷' : '✨'}
                    </span>
                    <span className="mention-item-body">
                      <span className="mention-item-label">{item.label}</span>
                      {item.sublabel && <span className="mention-item-sub">{item.sublabel}</span>}
                    </span>
                    <span className={`mention-item-badge mention-badge-${item.type}`}>
                      {item.type}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--muted)', margin: '6px 0 0' }}>
            Tip: type @ to tag a brand or product inline
          </p>
        </div>

        <label className="field">
          <span>Tags</span>
          <input
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            placeholder="Pigmentation, Mumbai humidity, Office makeup"
          />
        </label>
        <button type="submit" className="primary-button full" disabled={createPost.isPending}>
          {createPost.isPending ? 'Publishing...' : 'Publish post'}
        </button>
      </section>
    </form>
  )
}
