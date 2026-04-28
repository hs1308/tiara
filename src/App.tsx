import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import type { Location as RouterLocation } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { CreatePostForm } from './components/create-post/CreatePostForm'
import type { PostType } from './types'

const HomePage = lazy(() => import('./pages/HomePage').then((module) => ({ default: module.HomePage })))
const FeedPage = lazy(() => import('./pages/FeedPage').then((module) => ({ default: module.FeedPage })))
const ThreadPage = lazy(() => import('./pages/ThreadPage').then((module) => ({ default: module.ThreadPage })))
const ShopPage = lazy(() => import('./pages/ShopPage').then((module) => ({ default: module.ShopPage })))
const ProductPage = lazy(() => import('./pages/ProductPage').then((module) => ({ default: module.ProductPage })))
const CartPage = lazy(() => import('./pages/CartPage').then((module) => ({ default: module.CartPage })))
const WalletPage = lazy(() => import('./pages/WalletPage').then((module) => ({ default: module.WalletPage })))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage').then((module) => ({ default: module.CheckoutPage })))
const SuccessPage = lazy(() => import('./pages/SuccessPage').then((module) => ({ default: module.SuccessPage })))
const CreatePostPage = lazy(() => import('./pages/CreatePostPage').then((module) => ({ default: module.CreatePostPage })))
const ProfilePage = lazy(() => import('./pages/ProfilePage').then((module) => ({ default: module.ProfilePage })))
const BrandPage = lazy(() => import('./pages/BrandPage').then((module) => ({ default: module.BrandPage })))

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const state = location.state as { backgroundLocation?: RouterLocation } | null
  const backgroundLocation = state?.backgroundLocation
  const modalType = (searchParams.get('type') as PostType | null) ?? 'Product Talk'
  const modalProductId = searchParams.get('productId')

  return (
    <Suspense fallback={<div className="empty-state">Loading Tiara...</div>}>
      <Routes location={backgroundLocation || location}>
        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/feed/:postId" element={<ThreadPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:productId" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/success/:orderId" element={<SuccessPage />} />
          <Route path="/create" element={<CreatePostPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/brand/:brandSlug" element={<BrandPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {backgroundLocation ? (
        <Routes>
          <Route
            path="/create"
            element={
              <div className="modal-backdrop" onClick={() => navigate(-1)}>
                <div className="modal-dialog" onClick={(event) => event.stopPropagation()}>
                  <CreatePostForm
                    productId={modalProductId}
                    defaultType={modalType}
                    modal
                    onCancel={() => navigate(-1)}
                    onSuccess={(postId) => navigate(`/feed/${postId}`, { replace: true })}
                  />
                </div>
              </div>
            }
          />
        </Routes>
      ) : null}
    </Suspense>
  )
}

export default App
