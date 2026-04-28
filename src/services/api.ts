import { mockCartItems, mockComments, demoUserId, mockOrders, mockPosts, mockProducts, mockUsers } from '../data/mockData'
import { supabase } from '../lib/supabase'
import { randomId } from '../lib/utils'
import type { CartItem, Comment, OrderRecord, Post, Product, UserProfile } from '../types'

const STORAGE_KEYS = {
  users: 'tiara_users_local',
  products: 'tiara_products_local',
  posts: 'tiara_posts_local',
  comments: 'tiara_comments_local',
  cart: 'tiara_cart_items_local',
  orders: 'tiara_orders_local',
}

function readStorage<T>(key: string, fallback: T): T {
  const raw = window.localStorage.getItem(key)
  if (!raw) {
    window.localStorage.setItem(key, JSON.stringify(fallback))
    return fallback
  }

  try {
    return JSON.parse(raw) as T
  } catch {
    window.localStorage.setItem(key, JSON.stringify(fallback))
    return fallback
  }
}

function writeStorage<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

async function canUseSupabase() {
  if (!supabase) return false

  const { error } = await supabase.from('tiara_users').select('id').limit(1)
  return !error
}

export async function getUsers() {
  if (await canUseSupabase()) {
    const { data } = await supabase!.from('tiara_users').select('*')
    if (data?.length) return data as UserProfile[]
  }

  return readStorage<UserProfile[]>(STORAGE_KEYS.users, mockUsers)
}

export async function getCurrentUser() {
  const users = await getUsers()
  return users.find((user) => user.id === demoUserId) ?? users[0]
}

export async function getProducts() {
  if (await canUseSupabase()) {
    const { data } = await supabase!.from('tiara_products').select('*')
    if (data?.length) return data as Product[]
  }

  return readStorage<Product[]>(STORAGE_KEYS.products, mockProducts)
}

export async function getProductById(productId: string) {
  const products = await getProducts()
  return products.find((product) => product.id === productId) ?? null
}

export async function getPosts() {
  if (await canUseSupabase()) {
    const { data } = await supabase!.from('tiara_posts').select('*').order('createdAt', { ascending: false })
    if (data?.length) return data as Post[]
  }

  return readStorage<Post[]>(STORAGE_KEYS.posts, mockPosts)
}

export async function getPostById(postId: string) {
  const posts = await getPosts()
  return posts.find((post) => post.id === postId) ?? null
}

export async function getComments(postId?: string) {
  if (await canUseSupabase()) {
    let query = supabase!.from('tiara_comments').select('*').order('createdAt', { ascending: true })
    if (postId) query = query.eq('postId', postId)
    const { data } = await query
    if (data) return data as Comment[]
  }

  const comments = readStorage<Comment[]>(STORAGE_KEYS.comments, mockComments)
  return postId ? comments.filter((comment) => comment.postId === postId) : comments
}

export async function getCartItems() {
  if (await canUseSupabase()) {
    const { data } = await supabase!.from('tiara_cart_items').select('*').eq('userId', demoUserId)
    if (data) return data as CartItem[]
  }

  return readStorage<CartItem[]>(STORAGE_KEYS.cart, mockCartItems)
}

export async function addToCart(productId: string) {
  const items = await getCartItems()
  const existing = items.find((item) => item.productId === productId)
  const nextItems = existing
    ? items.map((item) =>
        item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item,
      )
    : [...items, { id: randomId('cart'), userId: demoUserId, productId, quantity: 1 }]

  if (await canUseSupabase()) {
    if (existing) {
      await supabase!
        .from('tiara_cart_items')
        .update({ quantity: existing.quantity + 1 })
        .eq('id', existing.id)
    } else {
      await supabase!.from('tiara_cart_items').insert({
        id: randomId('cart'),
        userId: demoUserId,
        productId,
        quantity: 1,
      })
    }
  }

  writeStorage(STORAGE_KEYS.cart, nextItems)
  return nextItems
}

export async function updateCartItem(itemId: string, quantity: number) {
  const items = await getCartItems()
  const nextItems = quantity <= 0 ? items.filter((item) => item.id !== itemId) : items.map((item) => (item.id === itemId ? { ...item, quantity } : item))

  if (await canUseSupabase()) {
    if (quantity <= 0) {
      await supabase!.from('tiara_cart_items').delete().eq('id', itemId)
    } else {
      await supabase!.from('tiara_cart_items').update({ quantity }).eq('id', itemId)
    }
  }

  writeStorage(STORAGE_KEYS.cart, nextItems)
  return nextItems
}

export async function createPost(input: Omit<Post, 'id' | 'upvotes' | 'commentCount' | 'createdAt'>) {
  const posts = await getPosts()
  const nextPost: Post = {
    ...input,
    id: randomId('post'),
    upvotes: 1,
    commentCount: 0,
    createdAt: new Date().toISOString(),
  }
  const nextPosts = [nextPost, ...posts]

  if (await canUseSupabase()) {
    await supabase!.from('tiara_posts').insert(nextPost)
  }

  writeStorage(STORAGE_KEYS.posts, nextPosts)
  return nextPost
}

export async function createComment(input: Omit<Comment, 'id' | 'createdAt' | 'upvotes'>) {
  const comments = await getComments()
  const nextComment: Comment = {
    ...input,
    id: randomId('comment'),
    createdAt: new Date().toISOString(),
    upvotes: 0,
  }
  const nextComments = [...comments, nextComment]

  if (await canUseSupabase()) {
    await supabase!.from('tiara_comments').insert(nextComment)
  }

  const posts = await getPosts()
  const nextPosts = posts.map((post) =>
    post.id === input.postId ? { ...post, commentCount: post.commentCount + 1 } : post,
  )
  writeStorage(STORAGE_KEYS.comments, nextComments)
  writeStorage(STORAGE_KEYS.posts, nextPosts)
  return nextComment
}

export async function createOrder(input: Omit<OrderRecord, 'id' | 'createdAt'>) {
  const orders = readStorage<OrderRecord[]>(STORAGE_KEYS.orders, mockOrders)
  const order: OrderRecord = {
    ...input,
    id: randomId('order'),
    createdAt: new Date().toISOString(),
  }
  const nextOrders = [order, ...orders]

  if (await canUseSupabase()) {
    await supabase!.from('tiara_orders').insert(order)
    await supabase!.from('tiara_cart_items').delete().eq('userId', demoUserId)
  }

  writeStorage(STORAGE_KEYS.orders, nextOrders)
  writeStorage(STORAGE_KEYS.cart, [])
  return order
}

export async function getOrders() {
  if (await canUseSupabase()) {
    const { data } = await supabase!.from('tiara_orders').select('*').eq('userId', demoUserId)
    if (data) return data as OrderRecord[]
  }

  return readStorage<OrderRecord[]>(STORAGE_KEYS.orders, mockOrders)
}
