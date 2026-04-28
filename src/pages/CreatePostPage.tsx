import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { demoUserId } from '../data/mockData'
import { useCreatePost, useProducts } from '../hooks/useTiaraData'
import type { PostType } from '../types'

const postTypes: PostType[] = [
  'Product Talk',
  'Skin & Hair Help',
  'Rec Request',
  'Routine Check',
  'Look & Feel',
]

export function CreatePostPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { data: products = [] } = useProducts()
  const createPost = useCreatePost()

  const productId = params.get('productId') ?? ''
  const defaultType = (params.get('type') as PostType | null) ?? 'Product Talk'
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
    navigate(`/feed/${nextPost.id}`)
  }

  return (
    <form className="page-stack" onSubmit={handleSubmit}>
      <section className="section-block section-tight">
        <div className="section-head">
          <div>
            <span className="section-kicker">Create post</span>
            <h2>Let users move from commerce back into community with one clean action</h2>
          </div>
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
        <button type="submit" className="primary-button full">
          Publish post
        </button>
      </section>
    </form>
  )
}
