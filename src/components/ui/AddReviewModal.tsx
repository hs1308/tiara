import { useState } from 'react'
import { X, Star, Camera } from 'lucide-react'
import { useCreatePost, useProducts } from '../../hooks/useTiaraData'
import { demoUserId } from '../../data/mockData'
import type { Product } from '../../types'

interface Props {
  preselectedProduct?: Product | null
  onClose: () => void
  onSuccess?: (postId: string) => void
}

export function AddReviewModal({ preselectedProduct, onClose, onSuccess }: Props) {
  const { data: products = [] } = useProducts()
  const createPost = useCreatePost()

  const [selectedProductId, setSelectedProductId] = useState(preselectedProduct?.id ?? '')
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [review, setReview] = useState('')
  const [error, setError] = useState('')

  const selectedProduct = products.find((p) => p.id === selectedProductId) ?? preselectedProduct

  async function handleSubmit() {
    if (!selectedProduct) { setError('Please select a product.'); return }
    if (rating === 0) { setError('Please give a rating.'); return }
    if (review.trim().length < 10) { setError('Please write at least a sentence.'); return }

    const title = `I rate ${selectedProduct.name} ${rating} out of 5`
    const post = await createPost.mutateAsync({
      authorId: demoUserId,
      productId: selectedProduct.id,
      brand: selectedProduct.brand,
      type: 'Review',
      title,
      description: review.trim(),
      image: null,
      tags: [selectedProduct.category, 'Review'],
      rating,
    })
    onSuccess?.(post.id)
    onClose()
  }

  return (
    <div className="face-scan-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="face-scan-modal add-review-modal">
        <button className="face-scan-close" type="button" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        <div className="add-review-header">
          <span className="section-kicker">Community review</span>
          <h2>Share your experience</h2>
        </div>

        {/* Product selector — only shown if not preselected */}
        {!preselectedProduct ? (
          <label className="field">
            <span>Which product are you reviewing?</span>
            <select
              value={selectedProductId}
              onChange={(e) => { setSelectedProductId(e.target.value); setError('') }}
            >
              <option value="">Select a product…</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.brand} — {p.name}</option>
              ))}
            </select>
          </label>
        ) : (
          <div className="review-preselected-product">
            <img src={preselectedProduct.heroImage} alt={preselectedProduct.name} className="review-product-thumb" />
            <div>
              <span className="eyebrow">{preselectedProduct.brand}</span>
              <strong className="review-product-name">{preselectedProduct.name}</strong>
            </div>
          </div>
        )}

        {/* Star rating */}
        <div className="review-rating-section">
          <span className="review-rating-label">Your rating</span>
          <div className="review-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="review-star-btn"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => { setRating(star); setError('') }}
                aria-label={`${star} star`}
              >
                <Star
                  size={32}
                  fill={(hoverRating || rating) >= star ? '#f59e0b' : 'none'}
                  color={(hoverRating || rating) >= star ? '#f59e0b' : '#d1d5db'}
                  strokeWidth={1.5}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <span className="review-rating-text">
              {['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'][rating]}
            </span>
          )}
        </div>

        {/* Review text */}
        <label className="field">
          <span>Your review</span>
          <textarea
            className="comment-form-inline-textarea"
            rows={5}
            placeholder="What did you love or not love? How long did you use it? Any tips for others?"
            value={review}
            onChange={(e) => { setReview(e.target.value); setError('') }}
          />
        </label>

        {/* Photo nudge — demo only */}
        <button type="button" className="review-photo-nudge" disabled>
          <Camera size={16} />
          Add photos (coming soon)
        </button>

        {error && <p className="form-error">{error}</p>}

        <button
          type="button"
          className="primary-button full"
          onClick={handleSubmit}
          disabled={createPost.isPending}
        >
          {createPost.isPending ? 'Publishing…' : 'Publish review'}
        </button>
      </div>
    </div>
  )
}
