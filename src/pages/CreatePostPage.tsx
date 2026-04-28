import { useNavigate, useSearchParams } from 'react-router-dom'
import { CreatePostForm } from '../components/create-post/CreatePostForm'
import type { PostType } from '../types'

export function CreatePostPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const productId = params.get('productId')
  const defaultType = (params.get('type') as PostType | null) ?? 'Product Talk'

  return (
    <CreatePostForm
      productId={productId}
      defaultType={defaultType}
      onSuccess={(postId) => navigate(`/feed/${postId}`)}
    />
  )
}
