import { useState } from 'react'
import { Chip } from '../components/ui/Chip'
import { PostCard } from '../components/ui/PostCard'
import { usePosts, useProducts, useUsers } from '../hooks/useTiaraData'
import type { FeedSort } from '../types'

const sortOptions: FeedSort[] = ['New', 'Trending', 'Popular']
const filters = ['All', 'Skincare', 'Makeup', 'Haircare', 'Routine help', 'Mumbai humidity']

export function FeedPage() {
  const [sort, setSort] = useState<FeedSort>('New')
  const [filter, setFilter] = useState('All')
  const { data: posts = [] } = usePosts()
  const { data: users = [] } = useUsers()
  const { data: products = [] } = useProducts()

  const sortedPosts = [...posts].sort((a, b) => {
    if (sort === 'Popular') return b.upvotes - a.upvotes
    if (sort === 'Trending') return b.commentCount - a.commentCount
    return +new Date(b.createdAt) - +new Date(a.createdAt)
  })

  const filteredPosts =
    filter === 'All'
      ? sortedPosts
      : sortedPosts.filter((post) => post.tags.some((tag) => tag.toLowerCase().includes(filter.toLowerCase())))

  return (
    <div className="page-stack">
      <section className="section-block section-tight">
        <div className="section-head">
          <div>
            <span className="section-kicker">Community feed</span>
            <h2>Fresh takes first, with product context stitched into every thread</h2>
          </div>
        </div>
        <div className="control-strip">
          {sortOptions.map((option) => (
            <Chip key={option} active={option === sort} onClick={() => setSort(option)}>
              {option}
            </Chip>
          ))}
        </div>
        <div className="control-strip">
          {filters.map((option) => (
            <Chip key={option} active={option === filter} onClick={() => setFilter(option)}>
              {option}
            </Chip>
          ))}
        </div>
      </section>

      <div className="feed-stack">
        {filteredPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            author={users.find((user) => user.id === post.authorId)}
            product={products.find((product) => product.id === post.productId)}
          />
        ))}
      </div>
    </div>
  )
}
