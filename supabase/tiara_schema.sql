create extension if not exists pgcrypto;

create table if not exists public.tiara_users (
  id text primary key,
  name text not null,
  username text not null unique,
  avatar text not null,
  city text not null,
  karma integer not null default 0,
  "walletBalance" integer not null default 0,
  badges jsonb not null default '[]'::jsonb,
  "skinType" text not null,
  "skinTone" text not null,
  "skinConcerns" jsonb not null default '[]'::jsonb,
  "hairType" text not null,
  "hairConcerns" jsonb not null default '[]'::jsonb,
  interests jsonb not null default '[]'::jsonb,
  bio text not null default ''
);

create table if not exists public.tiara_products (
  id text primary key,
  brand text not null,
  name text not null,
  category text not null,
  price integer not null,
  "originalPrice" integer not null,
  rating numeric(3,1) not null default 0,
  "ratingsCount" integer not null default 0,
  "communityScore" numeric(3,1) not null default 0,
  "discussionCount" integer not null default 0,
  size text not null,
  description text not null,
  "heroImage" text not null,
  gallery jsonb not null default '[]'::jsonb,
  tags jsonb not null default '[]'::jsonb,
  suitability jsonb not null default '[]'::jsonb,
  ingredients jsonb not null default '[]'::jsonb,
  "howToUse" text not null,
  offers jsonb not null default '[]'::jsonb
);

create table if not exists public.tiara_posts (
  id text primary key,
  "authorId" text not null references public.tiara_users(id) on delete cascade,
  "productId" text references public.tiara_products(id) on delete set null,
  brand text,
  type text not null,
  title text not null,
  description text not null,
  image text,
  tags jsonb not null default '[]'::jsonb,
  upvotes integer not null default 0,
  "commentCount" integer not null default 0,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.tiara_comments (
  id text primary key,
  "postId" text not null references public.tiara_posts(id) on delete cascade,
  "authorId" text not null references public.tiara_users(id) on delete cascade,
  body text not null,
  upvotes integer not null default 0,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.tiara_cart_items (
  id text primary key,
  "userId" text not null references public.tiara_users(id) on delete cascade,
  "productId" text not null references public.tiara_products(id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0)
);

create table if not exists public.tiara_orders (
  id text primary key,
  "userId" text not null references public.tiara_users(id) on delete cascade,
  items jsonb not null default '[]'::jsonb,
  subtotal integer not null default 0,
  "walletApplied" integer not null default 0,
  total integer not null default 0,
  "paymentMode" text not null,
  "addressLabel" text not null,
  "createdAt" timestamptz not null default now()
);

alter table public.tiara_users enable row level security;
alter table public.tiara_products enable row level security;
alter table public.tiara_posts enable row level security;
alter table public.tiara_comments enable row level security;
alter table public.tiara_cart_items enable row level security;
alter table public.tiara_orders enable row level security;

drop policy if exists "Public read tiara_users" on public.tiara_users;
create policy "Public read tiara_users" on public.tiara_users for select using (true);

drop policy if exists "Public read tiara_products" on public.tiara_products;
create policy "Public read tiara_products" on public.tiara_products for select using (true);

drop policy if exists "Public read tiara_posts" on public.tiara_posts;
create policy "Public read tiara_posts" on public.tiara_posts for select using (true);

drop policy if exists "Public write tiara_posts" on public.tiara_posts;
create policy "Public write tiara_posts" on public.tiara_posts for insert with check (true);

drop policy if exists "Public read tiara_comments" on public.tiara_comments;
create policy "Public read tiara_comments" on public.tiara_comments for select using (true);

drop policy if exists "Public write tiara_comments" on public.tiara_comments;
create policy "Public write tiara_comments" on public.tiara_comments for insert with check (true);

drop policy if exists "Public read tiara_cart_items" on public.tiara_cart_items;
create policy "Public read tiara_cart_items" on public.tiara_cart_items for select using (true);

drop policy if exists "Public write tiara_cart_items" on public.tiara_cart_items;
create policy "Public write tiara_cart_items" on public.tiara_cart_items for all using (true) with check (true);

drop policy if exists "Public read tiara_orders" on public.tiara_orders;
create policy "Public read tiara_orders" on public.tiara_orders for select using (true);

drop policy if exists "Public write tiara_orders" on public.tiara_orders;
create policy "Public write tiara_orders" on public.tiara_orders for insert with check (true);

insert into public.tiara_users (
  id, name, username, avatar, city, karma, "walletBalance", badges, "skinType", "skinTone",
  "skinConcerns", "hairType", "hairConcerns", interests, bio
)
values
  (
    'user-tiara-aanya',
    'Aanya Mehra',
    'aanyam',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    'Mumbai',
    1280,
    480,
    '["Skincare Veteran","Community Favourite"]'::jsonb,
    'Combination',
    'Medium-Wheatish',
    '["Pigmentation","Humidity","Acne marks"]'::jsonb,
    'Wavy',
    '["Frizz","Dry ends"]'::jsonb,
    '["Skincare","Makeup","Haircare","Lip care"]'::jsonb,
    'Always testing sunscreens, lip oils, and monsoon-proof basics.'
  ),
  (
    'user-tiara-rhea',
    'Rhea Kapoor',
    'rheadose',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80',
    'Bengaluru',
    880,
    210,
    '["Makeup Enthusiast"]'::jsonb,
    'Oily',
    'Dusky-Deep',
    '["Texture","Open pores"]'::jsonb,
    'Curly',
    '["Dryness"]'::jsonb,
    '["Makeup","Skincare","Fragrance"]'::jsonb,
    'Drugstore makeup lover with a soft spot for glossy lips.'
  ),
  (
    'user-tiara-naina',
    'Naina Rao',
    'nainaxskin',
    'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=400&q=80',
    'Hyderabad',
    1420,
    350,
    '["Haircare Enthusiast","Skincare Veteran"]'::jsonb,
    'Sensitive',
    'Light',
    '["Redness","Sensitivity"]'::jsonb,
    'Straight',
    '["Hair fall"]'::jsonb,
    '["Haircare","Skincare"]'::jsonb,
    'Ingredient labels first, impulse purchases later.'
  )
on conflict (id) do update set
  name = excluded.name,
  username = excluded.username,
  avatar = excluded.avatar,
  city = excluded.city,
  karma = excluded.karma,
  "walletBalance" = excluded."walletBalance",
  badges = excluded.badges,
  "skinType" = excluded."skinType",
  "skinTone" = excluded."skinTone",
  "skinConcerns" = excluded."skinConcerns",
  "hairType" = excluded."hairType",
  "hairConcerns" = excluded."hairConcerns",
  interests = excluded.interests,
  bio = excluded.bio;

insert into public.tiara_products (
  id, brand, name, category, price, "originalPrice", rating, "ratingsCount", "communityScore",
  "discussionCount", size, description, "heroImage", gallery, tags, suitability, ingredients,
  "howToUse", offers
)
values
  (
    'product-dot-key-sunscreen',
    'Dot & Key',
    'Watermelon Cooling Sunscreen SPF 50',
    'Skincare',
    549,
    649,
    4.4,
    1243,
    8.3,
    142,
    '50 ml',
    'A lightweight gel sunscreen with a dewy finish that works especially well in humid cities.',
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=80',
    '[
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&w=900&q=80"
    ]'::jsonb,
    '["Oily skin","Mumbai humidity","No white cast"]'::jsonb,
    '["Combination skin","Oily skin","Humid weather"]'::jsonb,
    '["Watermelon extract","Niacinamide","Hyaluronic acid"]'::jsonb,
    'Apply two fingers worth as the final step of your morning routine.',
    '["Extra 10% on prepaid orders","Use wallet credits on this product"]'::jsonb
  ),
  (
    'product-kay-beauty-concealer',
    'Kay Beauty',
    'Hydrating Concealer',
    'Makeup',
    899,
    999,
    4.6,
    812,
    8.8,
    76,
    '6 ml',
    'A creamy concealer with medium buildable coverage and a skin-like finish for everyday wear.',
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80',
    '[
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1583241800698-9ac50e93bb1e?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1631730486780-42dfd7694493?auto=format&fit=crop&w=900&q=80"
    ]'::jsonb,
    '["Brightening","Medium coverage","Everyday makeup"]'::jsonb,
    '["Normal skin","Combination skin","Beginner friendly"]'::jsonb,
    '["Mango butter","Marula oil","Liquorice extract"]'::jsonb,
    'Tap under the eyes and around the mouth, then blend with fingers or a sponge.',
    '["Combo offer with compact","Free mini on orders above Rs. 1999"]'::jsonb
  ),
  (
    'product-minimalist-serum',
    'Minimalist',
    '10% Niacinamide Face Serum',
    'Skincare',
    599,
    599,
    4.5,
    2190,
    8.1,
    211,
    '30 ml',
    'A barrier-friendly serum that helps with marks, texture, and excess oil over consistent use.',
    'https://images.unsplash.com/photo-1626784215021-2e39ccf971cd?auto=format&fit=crop&w=900&q=80',
    '[
      "https://images.unsplash.com/photo-1626784215021-2e39ccf971cd?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1556228578-dd6c7935df10?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80"
    ]'::jsonb,
    '["Pigmentation","Texture","Barrier support"]'::jsonb,
    '["Oily skin","Combination skin","Acne marks"]'::jsonb,
    '["Niacinamide 10%","Zinc PCA","Glycerin"]'::jsonb,
    'Use 2-3 drops after cleansing and before moisturiser, once daily to start.',
    '["No-cost EMI above Rs. 2500 cart value","Buy 2 get 5% off"]'::jsonb
  ),
  (
    'product-ordinary-lip-balm',
    'The Ordinary',
    'Squalane + Amino Acids Lip Balm',
    'Lip care',
    740,
    800,
    4.3,
    564,
    7.9,
    59,
    '15 ml',
    'A cushiony lip treatment that layers well under tints and survives AC-heavy office days.',
    'https://images.unsplash.com/photo-1619451684019-89f773c79b06?auto=format&fit=crop&w=900&q=80',
    '[
      "https://images.unsplash.com/photo-1619451684019-89f773c79b06?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1589985270958-b3e3c3f5d6d3?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=900&q=80"
    ]'::jsonb,
    '["Dry lips","Night routine","Soft finish"]'::jsonb,
    '["Dry lips","Sensitive lips","Minimal routine"]'::jsonb,
    '["Squalane","Amino acids","Emollients"]'::jsonb,
    'Swipe on throughout the day or use a thicker layer before bed.',
    '["Wallet credits applicable","Extra sample at checkout"]'::jsonb
  ),
  (
    'product-anomaly-mask',
    'Anomaly',
    'Bonding Hair Mask',
    'Haircare',
    799,
    899,
    4.2,
    433,
    7.7,
    38,
    '200 ml',
    'A rich rinse-off mask that smooths frizz without flattening waves, especially after hard water wash days.',
    'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=900&q=80',
    '[
      "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=900&q=80"
    ]'::jsonb,
    '["Frizz control","Weekly mask","Soft waves"]'::jsonb,
    '["Wavy hair","Dryness","Chemically treated hair"]'::jsonb,
    '["Quinoa protein","Avocado oil","Shea butter"]'::jsonb,
    'Use once or twice a week after shampoo. Leave in for 5-7 minutes.',
    '["Haircare duo offer live","Extra 15% with bank card"]'::jsonb
  ),
  (
    'product-sdj-mist',
    'Sol de Janeiro',
    'Cheirosa 62 Perfume Mist',
    'Fragrance',
    2399,
    2599,
    4.7,
    911,
    8.9,
    84,
    '90 ml',
    'A warm gourmand body mist that gets mentioned in nearly every compliment-worthy fragrance thread.',
    'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=80',
    '[
      "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1595425964073-89e1fb6ffdd3?auto=format&fit=crop&w=900&q=80"
    ]'::jsonb,
    '["Compliment magnet","Gourmand","Date night"]'::jsonb,
    '["Evening wear","Layering","Giftable"]'::jsonb,
    '["Salted caramel accord","Pistachio accord","Vanilla"]'::jsonb,
    'Spray on pulse points, clothes, or layer over a body lotion.',
    '["Festive beauty edit inclusion","Wallet credits up to Rs. 150"]'::jsonb
  )
on conflict (id) do update set
  brand = excluded.brand,
  name = excluded.name,
  category = excluded.category,
  price = excluded.price,
  "originalPrice" = excluded."originalPrice",
  rating = excluded.rating,
  "ratingsCount" = excluded."ratingsCount",
  "communityScore" = excluded."communityScore",
  "discussionCount" = excluded."discussionCount",
  size = excluded.size,
  description = excluded.description,
  "heroImage" = excluded."heroImage",
  gallery = excluded.gallery,
  tags = excluded.tags,
  suitability = excluded.suitability,
  ingredients = excluded.ingredients,
  "howToUse" = excluded."howToUse",
  offers = excluded.offers;

insert into public.tiara_posts (
  id, "authorId", "productId", brand, type, title, description, image, tags, upvotes, "commentCount", "createdAt"
)
values
  (
    'post-001',
    'user-tiara-rhea',
    'product-dot-key-sunscreen',
    'Dot & Key',
    'Product Talk',
    'This is the first sunscreen that survived a Mumbai auto ride',
    'I finally found something that does not pill over moisturiser and still looks decent by lunch. If you have combination skin and hate heavy formulas, this one is genuinely worth sampling.',
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
    '["Sunscreen","Mumbai humidity","Combination skin"]'::jsonb,
    286,
    24,
    '2026-04-27T11:22:00.000Z'
  ),
  (
    'post-002',
    'user-tiara-naina',
    'product-minimalist-serum',
    'Minimalist',
    'Rec Request',
    'Pigmentation routine for wedding season and long workdays?',
    'My main issue is old acne marks plus mild redness. I want a practical morning routine that layers well with makeup and sunscreen, not a ten-step fantasy.',
    null,
    '["Pigmentation","Routine help","Wedding season"]'::jsonb,
    119,
    18,
    '2026-04-28T06:35:00.000Z'
  ),
  (
    'post-003',
    'user-tiara-aanya',
    'product-kay-beauty-concealer',
    'Kay Beauty',
    'Look & Feel',
    'Office makeup that still looks soft after eight hours',
    'Used a hydrating base and finally stopped over-powdering. This concealer held up really well around the mouth. Curious what you would switch out for Delhi heat.',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
    '["Office makeup","Makeup base","Delhi heat"]'::jsonb,
    164,
    12,
    '2026-04-26T14:40:00.000Z'
  ),
  (
    'post-004',
    'user-tiara-rhea',
    'product-anomaly-mask',
    'Anomaly',
    'Routine Check',
    'Monsoon hair routine for frizz that does not cost a fortune',
    'This is the only combo that has helped my waves stay soft without turning greasy by day two. Would love a lighter leave-in recommendation.',
    null,
    '["Haircare","Frizz","Routine check"]'::jsonb,
    88,
    9,
    '2026-04-25T18:15:00.000Z'
  ),
  (
    'post-005',
    'user-tiara-naina',
    null,
    null,
    'Skin & Hair Help',
    'Why does every sunscreen sting around my nose lately?',
    'Barrier is probably compromised because even basic moisturiser tingles now. Looking for calming product suggestions and maybe a clue about what ingredient to avoid.',
    null,
    '["Sensitive skin","Barrier repair","Help"]'::jsonb,
    141,
    31,
    '2026-04-28T05:15:00.000Z'
  )
on conflict (id) do update set
  "authorId" = excluded."authorId",
  "productId" = excluded."productId",
  brand = excluded.brand,
  type = excluded.type,
  title = excluded.title,
  description = excluded.description,
  image = excluded.image,
  tags = excluded.tags,
  upvotes = excluded.upvotes,
  "commentCount" = excluded."commentCount",
  "createdAt" = excluded."createdAt";

insert into public.tiara_comments (id, "postId", "authorId", body, upvotes, "createdAt")
values
  (
    'comment-001',
    'post-001',
    'user-tiara-aanya',
    'Seconding this. It is one of the few formulas that stays comfortable under a tinted moisturiser in humid weather.',
    42,
    '2026-04-27T12:05:00.000Z'
  ),
  (
    'comment-002',
    'post-001',
    'user-tiara-naina',
    'If your skin is very dry you might still want a richer moisturiser underneath, but for oily-combination this texture is lovely.',
    26,
    '2026-04-27T13:16:00.000Z'
  ),
  (
    'comment-003',
    'post-002',
    'user-tiara-rhea',
    'I would keep mornings simple: niacinamide, moisturiser, sunscreen, then spot conceal where you need it.',
    16,
    '2026-04-28T07:14:00.000Z'
  ),
  (
    'comment-004',
    'post-005',
    'user-tiara-aanya',
    'This happened to me when I overused actives. I paused exfoliants for a week and switched to a barrier repair moisturiser.',
    33,
    '2026-04-28T06:03:00.000Z'
  )
on conflict (id) do update set
  "postId" = excluded."postId",
  "authorId" = excluded."authorId",
  body = excluded.body,
  upvotes = excluded.upvotes,
  "createdAt" = excluded."createdAt";

insert into public.tiara_cart_items (id, "userId", "productId", quantity)
values
  ('cart-001', 'user-tiara-aanya', 'product-dot-key-sunscreen', 1),
  ('cart-002', 'user-tiara-aanya', 'product-kay-beauty-concealer', 1)
on conflict (id) do update set
  "userId" = excluded."userId",
  "productId" = excluded."productId",
  quantity = excluded.quantity;
