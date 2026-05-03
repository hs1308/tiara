# Tiara — Dev Handoff Note
_Last updated: May 2026_

## Project Overview
**Tiara** — "A more organised Reddit for beauty and skincare with an e-commerce layer at the end."
Community first, commerce is infrastructure. No Add to Cart on Home or PLP. Products surface through community discussion.

**Stack:** React + TypeScript + Vite (frontend) · Supabase (backend)
**Repo:** `D:\Tiara\repo`
**Deployed:** tiara-beta.vercel.app
**PRD:** `D:\Tiara\PRD.md` (v2.0)
**Supabase URL:** https://auwbrydulogqlscfymbg.supabase.co

---

## Key Architecture

### Routes (`src/App.tsx`)
```
/             → HomePage
/feed         → FeedPage
/feed/:postId → ThreadPage
/shop         → ShopPage (Discover)
/product/:id  → ProductPage (PDP)
/brand/:slug  → BrandPage
/profile      → ProfilePage (own)
/user/:userId → UserProfilePage (others)
/inbox        → InboxPage
/inbox/:userId→ InboxPage (open convo)
/create       → CreatePostPage (modal wrapping CreatePostForm)
/cart         → CartPage
/wallet       → WalletPage
```

### Key Files
| File | Purpose |
|------|---------|
| `src/pages/HomePage.tsx` | Main homepage — 10 ordered sections |
| `src/pages/FeedPage.tsx` | Community feed with filters |
| `src/pages/ThreadPage.tsx` | Post thread view — comments, AI summary, Find this product |
| `src/pages/ShopPage.tsx` | Discover page (brands + products) |
| `src/pages/ProfilePage.tsx` | Own profile (Posts/Comments tabs) |
| `src/pages/UserProfilePage.tsx` | Other users' profiles — blue tick for experts |
| `src/pages/InboxPage.tsx` | Messaging inbox + chat |
| `src/components/create-post/CreatePostForm.tsx` | Post creation (Text/Images&Video/Link/Poll/AMA modes) |
| `src/components/ui/PostCard.tsx` | Feed post card — blue tick for expert authors |
| `src/components/layout/AppShell.tsx` | Top nav + MessagingProvider + inbox icon |
| `src/components/layout/BottomNav.tsx` | Bottom navigation |
| `src/data/mockData.ts` | All mock users, posts, comments, products |
| `src/types.ts` | TypeScript interfaces |
| `src/styles/app.css` | All CSS (single file) |
| `src/state/MessagingContext.tsx` | In-memory messaging state |
| `src/hooks/useTiaraData.ts` | All data hooks (Supabase + localStorage fallback) |
| `src/services/api.ts` | Supabase API layer |

---

## Mock Data (`src/data/mockData.ts`)

### Users
| ID | Name | Notes |
|----|------|-------|
| `user-tiara-aanya` | Aanya Mehra | demoUserId, combination skin, Mumbai |
| `user-tiara-rhea` | Rhea Kapoor | oily skin, Bengaluru |
| `user-tiara-naina` | Naina Rao | sensitive skin, Hyderabad |
| `user-expert-simran` | Simran Kaur | `isExpert: true`, `expertTitle: 'Certified Makeup Artist'` |

### Products
`product-plum-eye-gel`, `product-ordinary-caffeine`, `product-pilgrim-eye-serum`,
`product-dot-key-sunscreen`, `product-kay-beauty-concealer` (newLaunch),
`product-minimalist-serum`, `product-ordinary-lip-balm`,
`product-anomaly-mask` (newLaunch), `product-sdj-mist` (newLaunch)

### Key Posts
| ID | Type | Notes |
|----|------|-------|
| `post-expert-001` | Look & Feel | Simran's makeup routine — video post, expert |
| `post-ama-001` | AMA | Dr. Priya Menon dermatologist AMA |
| `post-poll-001` | Poll | Acne marks poll with pollOptions |
| `post-followed-001` | Product Talk | Rhea + Dot & Key Watermelon Sunscreen |
| `post-dc-001` | Skin & Hair Help | Dark circles WFH post |

### Key Comments
| ID | Post | Notes |
|----|------|-------|
| `ai-summary-expert-001` | post-expert-001 | AI summary, tags `@Hydrating Concealer` (clickable PDP link) |
| `comment-expert-untagged-001` | post-expert-001 | Untagged mentions — triggers "Find this product" button |
| `ai-summary-dc-001` | post-dc-001 | AI summary, tags `@Pilgrim 10% Vitamin C Under Eye Brightening Serum` |
| `comment-dc-untagged-001` | post-dc-001 | Untagged mentions — triggers "Find this product" button |

---

## Homepage Section Order (10 sections)
1. **Module 1+2 (merged)** — Based on recent search (dark circles) + recommended products + Ask a question CTA
2. **AMA Promo Card** — Dr. Priya Menon dermatologist AMA
3. **Module 3** — Your community needs you (posts needing replies)
4. **Community topics carousel** — What the community is talking about (by category)
5. **Poll Promo Card** — Acne marks poll (vote-gated results)
6. **Followed Product Post Card** — Rhea posted about Dot & Key Watermelon Sunscreen
7. **Module 4 (New launches)** — What the community is saying about new launches
8. **Expert spotlight** — "Hear from our experts" — Simran's post, 2 comments, Join discussion
9. **Review carousel** — Product reviews from the community
10. **CTA Band** — Complete your profile / Analyse Face

---

## Features Built (Complete List)

### ThreadPage (`src/pages/ThreadPage.tsx`)
- Full nested comment tree with collapse/expand
- Mention link renderer — `@product` (green→PDP), `@brand` (amber→brand page), `@ingredient` (purple→/shop?ingredient=X)
- `MentionTextarea` — @-mention dropdown for comments
- **AI Summary** — pinned to top, bullets rendered with `renderAISummaryBullet()` — `@ProductName` in bullets = clickable PDP link
- **"Find this product" button** — detects untagged informal product mentions (via `UNTAGGED_PRODUCT_MAP`). Single button per comment. On click reveals all detected products as individual PDP links below the button.
- `detectUntaggedProducts()` — scans comment body against pattern map, skips already @-tagged products
- **Blue tick + expertTitle** on post author (hero) when `author.isExpert === true`
- Thread title font: `clamp(1.25rem, 1.85vw, 1.85rem)` (reduced from 2rem)
- Spacing: `margin-top: 12px` on title, `10px` on description, `10px` on tag row
- Edit/delete own comments, reply threading, upvotes

### CreatePostForm (`src/components/create-post/CreatePostForm.tsx`)
- Mode tabs: Text / Images & Video / Link / Poll / AMA
- SmartTextarea with @product, @brand, @ingredient mention dropdowns
- MediaUpload with drag-and-drop, AI product auto-detection (hardcoded demo)
- **"+ Add skin profile" button** — appears in Text, Images & Video, and Link modes. Prepends `Skin type: X | Skin tone: Y | Concerns: Z` to description.
- PollBuilder (up to 6 options)
- AMA mode with info box
- TagsSection — dropdown-only tags from TAG_DB, Auto-suggest button
- Caption renamed to **Description** in Images & Video tab
- Link tab has Description textarea + skin profile button

### Expert System
- `types.ts`: `isExpert?: boolean`, `expertTitle?: string` on UserProfile
- Blue tick (shield SVG, #3b82f6) shown in: PostCard (feed), ThreadPage (post hero), UserProfilePage (profile hero), HomePage expert spotlight card
- `expert-title-tag` pill shown alongside blue tick

### HomePage
- All 10 sections in correct order (see above)
- Expert spotlight card: blue-tinted section, video post thumbnail with ▶ Video badge, author blue tick + title tag, description, tags, 2 inline comments, "Join the discussion" CTA

### Feed + PostCard
- Filters: category, brand, concern, ingredient, post type
- Expert authors show blue tick inline next to name in feed cards
- Author names/avatars link to `/user/:userId`

### Discover (ShopPage)
- Brand carousel: logo, name, % positive sentiment, 2-3 line community summary
- Product grid: 4:3 image, no Add to Cart, 3 community bullet points, "See community discussions" link

### Inbox + Messaging
- Two-panel layout (sidebar + chat)
- MessagingContext: in-memory, seeded demo messages
- AppShell: MessageCircle inbox icon with green dot indicator

### Profile
- ProfilePage: Posts + Comments tabs (Reddit-style with counts)
- UserProfilePage: blue tick + expertTitle for experts, Message button → /inbox/:userId

---

## CSS Variables
```css
--accent: #0f4f46 (dark green)
--accent-strong: #123830
--ink: dark text
--muted: grey text
--surface: card background
--line: border colour
```

---

## Git Workflow
No CLI access — user pushes manually:
```bash
cd D:\Tiara\repo
git add .
git commit -m "message"
git push
```
Vercel auto-deploys on push to main.

---

## Known Patterns & Rules

### Critical: Avoid duplicate JSX in HomePage
HomePage.tsx has historically accumulated orphaned JSX after the closing `}`. If Vercel throws `TS1128: Declaration or statement expected` errors at line 700+, the file has a duplicate block. Fix: use `filesystem:write_file` to rewrite the entire file — do NOT use incremental edits for HomePage return blocks.

### Data alignment for AI summary product links
`renderAISummaryBullet()` matches `@ProductName` against `product.name` exactly. Use the exact product `name` field, not `brand + name`. E.g. use `@Hydrating Concealer` not `@Kay Beauty Hydrating Concealer`.

### Skin profile button
Does NOT appear in edit mode (isEditMode check). Only for new posts.

### Untagged product detection
`UNTAGGED_PRODUCT_MAP` in ThreadPage maps informal lowercase references to product IDs. Add new entries there to support more products.

---

## Open / Pending Items
- Onboarding flow (3 screens: interests, skin profile, location)
- Search functionality
- My Orders page
- Notification design
- Ingredient pages as first-class entities
- Expert/verified badge system on profiles (beyond blue tick)
- Discover/PLP page redesign (no Add to Cart on listing) — partially done
- "Add skin profile" button in Text + media modes ✅ (done last session)
