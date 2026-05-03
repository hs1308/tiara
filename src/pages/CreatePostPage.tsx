import { useNavigate, useSearchParams } from 'react-router-dom'
import { CreatePostForm } from '../components/create-post/CreatePostForm'

export function CreatePostPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const productId = params.get('productId')
  const editPostId = params.get('edit')
  const tag = params.get('tag')
  const desc = params.get('desc')

  return (
    <CreatePostForm
      productId={productId}
      editPostId={editPostId}
      initialTags={tag ? [tag] : undefined}
      initialDescription={desc ?? undefined}
      onSuccess={(postId) => navigate(`/feed/${postId}`)}
    />
  )
}
