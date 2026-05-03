import { useRef, useState, useEffect, useCallback } from 'react'
import type { KeyboardEvent, FormEvent } from 'react'
import { demoUserId } from '../../data/mockData'
import { useCreatePost, useCurrentUser, useMentionSearch, usePost, useUpdatePost } from '../../hooks/useTiaraData'

// ── Types ─────────────────────────────────────────────────────────────────────

type PostMode = 'text' | 'media' | 'link' | 'poll' | 'ama'

interface PollOption {
  id: string
  text: string
}

interface CreatePostFormProps {
  productId?: string | null
  editPostId?: string | null
  initialTags?: string[]
  initialDescription?: string
  modal?: boolean
  onSuccess?: (postId: string) => void
  onCancel?: () => void
}

// ── Constants ─────────────────────────────────────────────────────────────────

// Hardcoded product detection for demo: any image upload tags these two
const AUTO_DETECTED_PRODUCTS = ['Watermelon Cooling Sunscreen', 'Hydrating Concealer']

// Tag DB — users can only pick from this list, cannot free-type custom tags
const TAG_DB = [
  'Pigmentation', 'Sunscreen', 'Hydration', 'Acne', 'Dry skin', 'Oily skin',
  'Combination skin', 'Sensitive skin', 'Anti-aging', 'SPF', 'Concealer',
  'Foundation', 'Moisturiser', 'Serum', 'Cleanser', 'Toner', 'Eye cream',
  'Lip care', 'Mumbai humidity', 'Office makeup', 'Skincare routine', 'Makeup',
  'Haircare', 'Body care', 'Fragrance', 'Niacinamide', 'Vitamin C', 'Retinol',
  'Hyaluronic acid', 'Salicylic acid', 'Dark circles', 'Under-eye',
  'South Asian skin', 'Barrier repair', 'Frizz', 'Routine check',
]

// Auto-suggested tags (demo: always suggest these 3 based on "content analysis")
const AUTO_SUGGESTED_TAGS = ['Pigmentation', 'Mumbai humidity', 'Office makeup']

// Ingredient list for @ingredient mentions
const INGREDIENT_LIST = [
  'Niacinamide', 'Vitamin C', 'Retinol', 'Hyaluronic acid', 'Salicylic acid',
  'Glycerin', 'Ceramides', 'Peptides', 'AHA', 'BHA', 'Zinc oxide',
  'Titanium dioxide', 'Aloe vera', 'Tea tree oil', 'Kojic acid',
  'Tranexamic acid', 'Lactic acid', 'Ferulic acid', 'Squalane', 'Bakuchiol',
  'Caffeine', 'EGCG', 'Watermelon extract', 'Mango butter', 'Marula oil',
  'Liquorice extract', 'Zinc PCA', 'Amino acids', 'Quinoa protein',
  'Avocado oil', 'Shea butter',
]

const MODES: { key: PostMode; label: string }[] = [
  { key: 'text', label: 'Text' },
  { key: 'media', label: 'Images & Video' },
  { key: 'link', label: 'Link' },
  { key: 'poll', label: 'Poll' },
  { key: 'ama', label: 'AMA' },
]

// ── SmartTextarea ─────────────────────────────────────────────────────────────
// Handles @product and @ingredient mentions with dropdown

interface SmartTextareaProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
  required?: boolean
}

function SmartTextarea({ value, onChange, placeholder, rows = 6, required }: SmartTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [mentionQuery, setMentionQuery] = useState<string | null>(null)
  const [mentionStart, setMentionStart] = useState(-1)

  // Reuse existing useMentionSearch hook for products/brands
  const { data: productMentions = [] } = useMentionSearch(mentionQuery)

  // Also surface matching ingredients
  const ingredientMatches =
    mentionQuery !== null
      ? INGREDIENT_LIST.filter((i) =>
          i.toLowerCase().includes(mentionQuery.toLowerCase()),
        ).slice(0, 4)
      : []

  const showDropdown =
    mentionQuery !== null && (productMentions.length > 0 || ingredientMatches.length > 0)

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value
    onChange(val)
    const cursor = e.target.selectionStart ?? val.length
    const textBefore = val.slice(0, cursor)
    const atIndex = textBefore.lastIndexOf('@')
    if (atIndex !== -1) {
      const query = textBefore.slice(atIndex + 1)
      if (!query.includes('\n')) {
        setMentionQuery(query)
        setMentionStart(atIndex)
        return
      }
    }
    setMentionQuery(null)
    setMentionStart(-1)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (mentionQuery !== null && e.key === 'Escape') {
      setMentionQuery(null)
    }
  }

  function insertMention(label: string) {
    if (mentionStart === -1 || !textareaRef.current) return
    const cursor = textareaRef.current.selectionStart ?? value.length
    const before = value.slice(0, mentionStart)
    const after = value.slice(cursor)
    const inserted = `@${label} `
    onChange(before + inserted + after)
    setMentionQuery(null)
    setMentionStart(-1)
    setTimeout(() => {
      if (textareaRef.current) {
        const pos = before.length + inserted.length
        textareaRef.current.focus()
        textareaRef.current.setSelectionRange(pos, pos)
      }
    }, 0)
  }

  return (
    <div className="mention-wrap">
      <textarea
        ref={textareaRef}
        className="comment-form-inline-textarea create-post-textarea"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        rows={rows}
        placeholder={placeholder}
        required={required}
      />
      {showDropdown && (
        <div className="mention-dropdown">
          {ingredientMatches.length > 0 && (
            <>
              <div className="mention-group-label">Ingredients</div>
              {ingredientMatches.map((name) => (
                <button
                  key={`ing-${name}`}
                  type="button"
                  className="mention-item"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    insertMention(name)
                  }}
                >
                  <span className="mention-item-icon">🧪</span>
                  <span className="mention-item-body">
                    <span className="mention-item-label">{name}</span>
                  </span>
                  <span className="mention-item-badge mention-badge-ingredient">ingredient</span>
                </button>
              ))}
            </>
          )}
          {productMentions.length > 0 && (
            <>
              <div className="mention-group-label">Products & Brands</div>
              {productMentions.map((item) => (
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
                    {item.sublabel && (
                      <span className="mention-item-sub">{item.sublabel}</span>
                    )}
                  </span>
                  <span className={`mention-item-badge mention-badge-${item.type}`}>
                    {item.type}
                  </span>
                </button>
              ))}
            </>
          )}
        </div>
      )}

    </div>
  )
}

// ── MediaUpload ───────────────────────────────────────────────────────────────

function MediaUpload({ onProductsDetected }: { onProductsDetected: (products: string[]) => void }) {
  const [previews, setPreviews] = useState<string[]>([])
  const [detecting, setDetecting] = useState(false)
  const [detected, setDetected] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return
      const newPreviews = Array.from(files).map((f) => URL.createObjectURL(f))
      setPreviews((prev) => [...prev, ...newPreviews])
      setDetecting(true)
      setDetected(false)
      // Simulate AI product detection — hardcoded for demo
      setTimeout(() => {
        setDetecting(false)
        setDetected(true)
        onProductsDetected(AUTO_DETECTED_PRODUCTS)
      }, 1600)
    },
    [onProductsDetected],
  )

  function removePreview(idx: number) {
    setPreviews((prev) => prev.filter((_, i) => i !== idx))
  }

  return (
    <div className="media-upload-section">
      {previews.length > 0 && (
        <div className="media-preview-grid">
          {previews.map((src, i) => (
            <div key={i} className="media-preview-thumb">
              <img src={src} alt="" />
              <button
                type="button"
                className="media-preview-remove"
                onClick={() => removePreview(i)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {detecting && (
        <div className="product-detection-banner">
          <span className="detection-spinner" />
          Identifying products in your image…
        </div>
      )}

      {detected && !detecting && (
        <div className="product-detection-success">
          <span className="detection-check">✓</span>
          Products auto-tagged in your caption below
        </div>
      )}

      <div
        className="upload-dropzone"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          handleFiles(e.dataTransfer.files)
        }}
      >
        <svg
          className="upload-dropzone-icon"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <p className="upload-dropzone-text">
          Drag & drop or <span className="upload-dropzone-link">browse</span>
        </p>
        <p className="upload-dropzone-sub">Products in photos will be auto-tagged</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
    </div>
  )
}

// ── PollBuilder ───────────────────────────────────────────────────────────────

function PollBuilder({ options, onChange }: { options: PollOption[]; onChange: (opts: PollOption[]) => void }) {
  function update(id: string, text: string) {
    onChange(options.map((o) => (o.id === id ? { ...o, text } : o)))
  }
  function add() {
    onChange([...options, { id: Date.now().toString(), text: '' }])
  }
  function remove(id: string) {
    onChange(options.filter((o) => o.id !== id))
  }

  return (
    <div className="poll-builder">
      {options.map((opt, idx) => (
        <div key={opt.id} className="poll-option-row">
          <span className="poll-option-num">{idx + 1}</span>
          <input
            type="text"
            className="field-input"
            placeholder={`Option ${idx + 1}`}
            value={opt.text}
            onChange={(e) => update(opt.id, e.target.value)}
          />
          {options.length > 2 && (
            <button type="button" className="poll-option-remove" onClick={() => remove(opt.id)}>
              ×
            </button>
          )}
        </div>
      ))}
      {options.length < 6 && (
        <button type="button" className="secondary-button poll-add-btn" onClick={add}>
          + Add option
        </button>
      )}
    </div>
  )
}

// ── TagsSection ───────────────────────────────────────────────────────────────

function TagsSection({ tags, onChange }: { tags: string[]; onChange: (t: string[]) => void }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [autoAddedTags, setAutoAddedTags] = useState<string[]>([])

  const filtered = TAG_DB.filter(
    (t) => !tags.includes(t) && t.toLowerCase().includes(query.toLowerCase()),
  ).slice(0, 8)

  function addTag(tag: string) {
    if (!tags.includes(tag)) onChange([...tags, tag])
    setQuery('')
    setOpen(false)
  }

  function removeTag(tag: string) {
    onChange(tags.filter((t) => t !== tag))
    setAutoAddedTags((prev) => prev.filter((t) => t !== tag))
  }

  function handleAutoSuggest() {
    const toAdd = AUTO_SUGGESTED_TAGS.filter((t) => !tags.includes(t))
    onChange([...tags, ...toAdd])
    setAutoAddedTags((prev) => [...new Set([...prev, ...toAdd])])
  }

  return (
    <div className="tags-section">
      {tags.length > 0 && (
        <div className="tag-row tags-chips-row">
          {tags.map((tag) => (
            <span
              key={tag}
              className={`tag-pill tag-chip-removable${autoAddedTags.includes(tag) ? ' tag-chip-auto' : ''}`}
            >
              {tag}
              <button
                type="button"
                className="tag-chip-remove"
                onClick={() => removeTag(tag)}
                aria-label={`Remove ${tag}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="tags-input-row">
        <div className="tags-input-wrap">
          <input
            type="text"
            className="field-input"
            placeholder="Search tags…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
          />
          {open && filtered.length > 0 && (
            <div className="tags-dropdown">
              {filtered.map((t) => (
                <button
                  key={t}
                  type="button"
                  className="tags-dropdown-item"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    addTag(t)
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
        <button type="button" className="auto-suggest-btn" onClick={handleAutoSuggest}>
          ✦ Auto-suggest
        </button>
      </div>

    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export function CreatePostForm({
  productId,
  editPostId,
  initialTags,
  initialDescription,
  modal,
  onSuccess,
  onCancel,
}: CreatePostFormProps) {
  const { data: existingPost } = usePost(editPostId ?? '')
  const { data: currentUser } = useCurrentUser()
  const createPost = useCreatePost()
  const updatePostMutation = useUpdatePost()
  const isEditMode = !!editPostId
  const isPending = isEditMode ? updatePostMutation.isPending : createPost.isPending

  const [mode, setMode] = useState<PostMode>('text')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState(initialDescription ?? '')
  const [tags, setTags] = useState<string[]>(initialTags ?? [])
  const [link, setLink] = useState('')
  const [pollOptions, setPollOptions] = useState<PollOption[]>([
    { id: '1', text: '' },
    { id: '2', text: '' },
  ])

  // Pre-fill when editing
  useEffect(() => {
    if (existingPost && isEditMode) {
      setTitle(existingPost.title)
      setDescription(existingPost.description)
      setTags(Array.isArray(existingPost.tags) ? existingPost.tags : [])
    }
  }, [existingPost?.id, isEditMode])

  // When image uploaded, append auto-detected products to description
  const handleProductsDetected = useCallback((products: string[]) => {
    const productLine = `\nProducts: ${products.map((p) => `@${p}`).join(', ')}`
    setDescription((prev) => {
      if (prev.includes('Products:')) return prev
      return prev + productLine
    })
  }, [])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (isEditMode && editPostId) {
      const updated = await updatePostMutation.mutateAsync({
        postId: editPostId,
        input: { title, description, tags },
      })
      onSuccess?.(updated.id)
    } else {
      const nextPost = await createPost.mutateAsync({
        authorId: demoUserId,
        productId: productId ?? null,
        brand: null,
        type: 'Product Talk', // type field kept in DB for backwards compat but not shown in UI
        title,
        description,
        image: null,
        tags,
      })
      onSuccess?.(nextPost.id)
    }
  }

  return (
    <form className="page-stack" onSubmit={handleSubmit}>
      <section className={`section-block section-tight${modal ? ' modal-section' : ''}`}>
        {/* Header */}
        <div className="section-head">
          <div>
            <span className="section-kicker">{isEditMode ? 'Edit post' : 'Create post'}</span>
            <h2>{isEditMode ? 'Update your post' : 'Share your experience with the community'}</h2>
          </div>
          {modal && (
            <button type="button" className="secondary-button" onClick={onCancel}>
              Close
            </button>
          )}
        </div>

        {/* Mode tabs — Reddit style */}
        {!isEditMode && (
          <div className="post-mode-tabs" role="tablist">
            {MODES.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={mode === key}
                className={`post-mode-tab${mode === key ? ' post-mode-tab-active' : ''}`}
                onClick={() => setMode(key)}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Title — always shown */}
        <label className="field">
          <span>
            {mode === 'ama'
              ? 'Introduce yourself'
              : mode === 'poll'
                ? 'Your question'
                : 'Title'}
          </span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              mode === 'ama'
                ? "e.g. I'm a dermatologist — ask me anything about skincare"
                : mode === 'poll'
                  ? 'What do you want to ask the community?'
                  : "What's on your mind?"
            }
            required
          />
        </label>

        {/* Mode-specific content */}
        {(mode === 'text' || isEditMode) && (
          <div className="field">
            <div className="field-label-row">
              <span>Description</span>
              {!isEditMode && (
                <button
                  type="button"
                  className="skin-profile-btn"
                  onClick={() => {
                    if (!currentUser) return
                    const profile = `Skin type: ${currentUser.skinType} | Skin tone: ${currentUser.skinTone} | Concerns: ${currentUser.skinConcerns.join(', ')}\n\n`
                    setDescription((prev) => profile + prev)
                  }}
                >
                  + Add skin profile
                </button>
              )}
            </div>
            <SmartTextarea
              value={description}
              onChange={setDescription}
              placeholder="What worked, what surprised you? Use @product, @ingredient or @brand to tag something."
              required
            />
          </div>
        )}

        {mode === 'media' && !isEditMode && (
          <>
            <div className="field">
              <span>Images & Video</span>
              <MediaUpload onProductsDetected={handleProductsDetected} />
            </div>
            <div className="field">
              <div className="field-label-row">
                <span>Description</span>
                <button
                  type="button"
                  className="skin-profile-btn"
                  onClick={() => {
                    if (!currentUser) return
                    const profile = `Skin type: ${currentUser.skinType} | Skin tone: ${currentUser.skinTone} | Concerns: ${currentUser.skinConcerns.join(', ')}\n\n`
                    setDescription((prev) => profile + prev)
                  }}
                >
                  + Add skin profile
                </button>
              </div>
              <SmartTextarea
                value={description}
                onChange={setDescription}
                placeholder="Describe what you're sharing. Products in your photo will be auto-tagged above."
                rows={4}
              />
            </div>
          </>
        )}

        {mode === 'link' && !isEditMode && (
          <>
            <label className="field">
              <span>URL</span>
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://…"
                required
              />
            </label>
            <div className="field">
              <div className="field-label-row">
                <span>Description</span>
                <button
                  type="button"
                  className="skin-profile-btn"
                  onClick={() => {
                    if (!currentUser) return
                    const profile = `Skin type: ${currentUser.skinType} | Skin tone: ${currentUser.skinTone} | Concerns: ${currentUser.skinConcerns.join(', ')}\n\n`
                    setDescription((prev) => profile + prev)
                  }}
                >
                  + Add skin profile
                </button>
              </div>
              <SmartTextarea
                value={description}
                onChange={setDescription}
                placeholder="What's interesting about this link? Share your take."
                rows={4}
              />
            </div>
          </>
        )}

        {mode === 'poll' && !isEditMode && (
          <div className="field">
            <span>Poll options</span>
            <PollBuilder options={pollOptions} onChange={setPollOptions} />
          </div>
        )}

        {mode === 'ama' && !isEditMode && (
          <>
            <div className="ama-info-box">
              <strong>How AMAs work</strong>
              <p>
                Community members can ask you questions for 24 hours after you post. You'll be
                notified and can reply to each one. Your expertise or experience is the topic.
              </p>
            </div>
            <div className="field">
              <span>About you <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(optional)</span></span>
              <SmartTextarea
                value={description}
                onChange={setDescription}
                placeholder="Tell the community who you are and why you're doing this AMA…"
                rows={4}
              />
            </div>
          </>
        )}

        {/* Tags — always shown */}
        <div className="field">
          <span>Tags</span>
          <TagsSection tags={tags} onChange={setTags} />
        </div>

        <button type="submit" className="primary-button full" disabled={isPending}>
          {isPending
            ? isEditMode
              ? 'Saving…'
              : 'Publishing…'
            : isEditMode
              ? 'Save changes'
              : 'Publish post'}
        </button>
      </section>
    </form>
  )
}
