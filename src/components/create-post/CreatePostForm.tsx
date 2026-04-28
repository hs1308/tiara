import { useState } from 'react'
import type { FormEvent } from 'react'
import { demoUserId } from '../../data/mockData'
import { useCreatePost, useProducts } from '../../hooks/useTiaraData'
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
            <h2>Let users move from commerce back into community with one clean action</h2>
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
        <label className="field">
          <span>Description</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={6}
            placeholder="What worked, what surprised you, and what should the next buyer know?"
            required
          />
        </label>
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
