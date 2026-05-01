export type InterestCategory =
  | 'Skincare'
  | 'Makeup'
  | 'Haircare'
  | 'Nailcare'
  | 'Fragrance'
  | 'Lip care'

export type PostType =
  | 'Product Talk'
  | 'Skin & Hair Help'
  | 'Rec Request'
  | 'Routine Check'
  | 'Look & Feel'

export type FeedSort = 'New' | 'Trending' | 'Popular'

export interface UserProfile {
  id: string
  name: string
  username: string
  avatar: string
  city: string
  karma: number
  walletBalance: number
  badges: string[]
  skinType: string
  skinTone: string
  skinConcerns: string[]
  hairType: string
  hairConcerns: string[]
  interests: InterestCategory[]
  bio: string
}

export interface Product {
  id: string
  brand: string
  name: string
  category: InterestCategory
  price: number
  originalPrice: number
  rating: number
  ratingsCount: number
  communityScore: number
  discussionCount: number
  size: string
  description: string
  heroImage: string
  gallery: string[]
  tags: string[]
  suitability: string[]
  ingredients: string[]
  howToUse: string
  offers: string[]
  newLaunch?: boolean
}

export interface Post {
  id: string
  authorId: string
  productId?: string | null
  brand?: string | null
  type: PostType
  title: string
  description: string
  image?: string | null
  tags: string[]
  upvotes: number
  commentCount: number
  createdAt: string
  isPinnedSummary?: boolean
}

export interface Comment {
  id: string
  postId: string
  authorId: string
  body: string
  upvotes: number
  createdAt: string
  parentId?: string | null
}

export interface CartItem {
  id: string
  userId: string
  productId: string
  quantity: number
}

export interface Brand {
  id: string
  name: string
  slug: string
  description: string
  logo: string | null
  coverImage: string | null
}

export interface OrderRecord {
  id: string
  userId: string
  items: Array<{ productId: string; quantity: number }>
  subtotal: number
  walletApplied: number
  total: number
  paymentMode: string
  addressLabel: string
  createdAt: string
}
