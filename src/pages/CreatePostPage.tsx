import { useNavigate, useSearchParams } from 'react-router-dom'
import { CreatePostForm } from '../components/create-post/CreatePostForm'

export function CreatePostPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const productId = params.get('productId')
  const editPostId = params.get('edit')

  return (
    <CreatePostForm
      productId={productId}
      editPostId={editPostId}
      onSuccess={(postId) => navigate(`/feed/${postId}`)}
    />
  )
}
