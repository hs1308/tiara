import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addToCart,
  createComment,
  createOrder,
  createPost,
  getBrands,
  getCartItems,
  getComments,
  getCurrentUser,
  getOrders,
  getPostById,
  getPosts,
  getProductById,
  getProducts,
  getUsers,
  placeOrder,
  removeFromCart,
  searchBrandsAndProducts,
  upvoteComment,
  updateCartItem,
} from '../services/api'
import type { PlaceOrderInput } from '../services/api'

export function useCurrentUser() {
  return useQuery({ queryKey: ['current-user'], queryFn: getCurrentUser })
}

export function useUsers() {
  return useQuery({ queryKey: ['users'], queryFn: getUsers })
}

export function useProducts() {
  return useQuery({ queryKey: ['products'], queryFn: getProducts })
}

export function useBrands() {
  return useQuery({ queryKey: ['brands'], queryFn: getBrands })
}

export function useMentionSearch(query: string | null) {
  return useQuery({
    queryKey: ['mention-search', query],
    queryFn: () => searchBrandsAndProducts(query!),
    enabled: query !== null && query.length >= 0,
    staleTime: 10_000,
  })
}

export function useProduct(productId: string) {
  return useQuery({ queryKey: ['product', productId], queryFn: () => getProductById(productId) })
}

export function usePosts() {
  return useQuery({ queryKey: ['posts'], queryFn: getPosts })
}

export function usePost(postId: string) {
  return useQuery({ queryKey: ['post', postId], queryFn: () => getPostById(postId) })
}

export function useComments(postId?: string) {
  return useQuery({
    queryKey: ['comments', postId ?? 'all'],
    queryFn: () => getComments(postId),
  })
}

export function useCart() {
  return useQuery({ queryKey: ['cart'], queryFn: getCartItems })
}

export function useCartCount() {
  const { data: cartItems = [] } = useCart()
  return cartItems.reduce((sum, item) => sum + item.quantity, 0)
}

export function useOrders() {
  return useQuery({ queryKey: ['orders'], queryFn: getOrders })
}

export function useAddToCart() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: addToCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      updateCartItem(itemId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (itemId: string) => removeFromCart(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })
}

export function usePlaceOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: PlaceOrderInput) => placeOrder(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['current-user'] })
    },
  })
}

export function useCreatePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}

export function useCreateComment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createComment,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['comments', variables.postId] })
      const previousComments = queryClient.getQueryData(['comments', variables.postId])
      const previousPost = queryClient.getQueryData(['post', variables.postId])
      const optimisticComment = {
        id: `optimistic-${Date.now()}`,
        postId: variables.postId,
        authorId: variables.authorId,
        body: variables.body,
        upvotes: 0,
        createdAt: new Date().toISOString(),
        parentId: variables.parentId ?? null,
      }
      queryClient.setQueryData(['comments', variables.postId], (current: unknown) => {
        if (!Array.isArray(current)) return [optimisticComment]
        return [...current, optimisticComment]
      })
      queryClient.setQueryData(['post', variables.postId], (current: unknown) => {
        if (!current || typeof current !== 'object') return current
        return { ...current, commentCount: Number((current as { commentCount?: number }).commentCount ?? 0) + 1 }
      })
      return { previousComments, previousPost, optimisticId: optimisticComment.id, postId: variables.postId }
    },
    onError: (_error, variables, context) => {
      if (context?.previousComments) queryClient.setQueryData(['comments', variables.postId], context.previousComments)
      if (context?.previousPost) queryClient.setQueryData(['post', variables.postId], context.previousPost)
    },
    onSuccess: (comment, variables) => {
      queryClient.setQueryData(['comments', variables.postId], (current: unknown) => {
        if (!Array.isArray(current)) return [comment]
        const withoutOptimistic = current.filter(
          (entry) => !(entry && typeof entry === 'object' && 'id' in entry && String(entry.id).startsWith('optimistic-')),
        )
        const exists = withoutOptimistic.some(
          (entry) => entry && typeof entry === 'object' && 'id' in entry && entry.id === comment.id,
        )
        return exists ? withoutOptimistic : [...withoutOptimistic, comment]
      })
      queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] })
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      queryClient.invalidateQueries({ queryKey: ['post', variables.postId] })
    },
  })
}

export function useUpvoteComment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: upvoteComment,
    onMutate: async ({ commentId, postId }) => {
      await queryClient.cancelQueries({ queryKey: ['comments', postId] })
      const previous = queryClient.getQueryData(['comments', postId])
      queryClient.setQueryData(['comments', postId], (current: unknown) => {
        if (!Array.isArray(current)) return current
        return current.map((comment) =>
          comment && typeof comment === 'object' && 'id' in comment && comment.id === commentId
            ? { ...comment, upvotes: Number(comment.upvotes ?? 0) + 1 }
            : comment,
        )
      })
      return { previous, postId }
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(['comments', context.postId], context.previous)
    },
    onSuccess: (comment) => {
      queryClient.invalidateQueries({ queryKey: ['comments', comment?.postId ?? 'all'] })
    },
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })
}
