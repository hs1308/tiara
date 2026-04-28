create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

alter table public.tiara_posts
  add column if not exists "updatedAt" timestamptz not null default now();

alter table public.tiara_comments
  add column if not exists "updatedAt" timestamptz not null default now(),
  add column if not exists "parentId" text references public.tiara_comments(id) on delete cascade;

alter table public.tiara_cart_items
  add column if not exists "updatedAt" timestamptz not null default now();

create table if not exists public.tiara_brands (
  id text primary key,
  name text not null unique,
  slug text not null unique,
  description text not null default '',
  logo text,
  "coverImage" text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

alter table public.tiara_products
  add column if not exists "brandId" text references public.tiara_brands(id) on delete set null,
  add column if not exists slug text,
  add column if not exists "updatedAt" timestamptz not null default now();

create table if not exists public.tiara_post_tags_catalog (
  id text primary key,
  label text not null unique,
  slug text not null unique,
  category text not null default 'topic',
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.tiara_post_product_tags (
  id text primary key,
  "postId" text not null references public.tiara_posts(id) on delete cascade,
  "productId" text not null references public.tiara_products(id) on delete cascade,
  "createdAt" timestamptz not null default now(),
  unique ("postId", "productId")
);

create table if not exists public.tiara_post_brand_tags (
  id text primary key,
  "postId" text not null references public.tiara_posts(id) on delete cascade,
  "brandId" text not null references public.tiara_brands(id) on delete cascade,
  "createdAt" timestamptz not null default now(),
  unique ("postId", "brandId")
);

create table if not exists public.tiara_post_topic_tags (
  id text primary key,
  "postId" text not null references public.tiara_posts(id) on delete cascade,
  "tagId" text not null references public.tiara_post_tags_catalog(id) on delete cascade,
  "createdAt" timestamptz not null default now(),
  unique ("postId", "tagId")
);

create table if not exists public.tiara_comment_mentions (
  id text primary key,
  "commentId" text not null references public.tiara_comments(id) on delete cascade,
  "entityType" text not null check ("entityType" in ('product', 'brand')),
  "productId" text references public.tiara_products(id) on delete cascade,
  "brandId" text references public.tiara_brands(id) on delete cascade,
  label text not null,
  "createdAt" timestamptz not null default now(),
  check (
    ("entityType" = 'product' and "productId" is not null and "brandId" is null)
    or
    ("entityType" = 'brand' and "brandId" is not null and "productId" is null)
  )
);

create unique index if not exists tiara_cart_items_user_product_idx
  on public.tiara_cart_items ("userId", "productId");

create index if not exists tiara_comments_parent_id_idx
  on public.tiara_comments ("parentId");

create index if not exists tiara_post_product_tags_post_idx
  on public.tiara_post_product_tags ("postId");

create index if not exists tiara_post_product_tags_product_idx
  on public.tiara_post_product_tags ("productId");

create index if not exists tiara_post_brand_tags_post_idx
  on public.tiara_post_brand_tags ("postId");

create index if not exists tiara_post_brand_tags_brand_idx
  on public.tiara_post_brand_tags ("brandId");

create index if not exists tiara_post_topic_tags_post_idx
  on public.tiara_post_topic_tags ("postId");

create index if not exists tiara_comment_mentions_comment_idx
  on public.tiara_comment_mentions ("commentId");

create index if not exists tiara_comment_mentions_product_idx
  on public.tiara_comment_mentions ("productId");

create index if not exists tiara_comment_mentions_brand_idx
  on public.tiara_comment_mentions ("brandId");

create index if not exists tiara_products_name_trgm_idx
  on public.tiara_products using gin (lower(name) gin_trgm_ops);

create index if not exists tiara_brands_name_trgm_idx
  on public.tiara_brands using gin (lower(name) gin_trgm_ops);

create index if not exists tiara_post_tags_label_trgm_idx
  on public.tiara_post_tags_catalog using gin (lower(label) gin_trgm_ops);

create or replace function public.tiara_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new."updatedAt" = now();
  return new;
end;
$$;

drop trigger if exists tiara_posts_touch_updated_at on public.tiara_posts;
create trigger tiara_posts_touch_updated_at
before update on public.tiara_posts
for each row execute function public.tiara_touch_updated_at();

drop trigger if exists tiara_comments_touch_updated_at on public.tiara_comments;
create trigger tiara_comments_touch_updated_at
before update on public.tiara_comments
for each row execute function public.tiara_touch_updated_at();

drop trigger if exists tiara_products_touch_updated_at on public.tiara_products;
create trigger tiara_products_touch_updated_at
before update on public.tiara_products
for each row execute function public.tiara_touch_updated_at();

drop trigger if exists tiara_brands_touch_updated_at on public.tiara_brands;
create trigger tiara_brands_touch_updated_at
before update on public.tiara_brands
for each row execute function public.tiara_touch_updated_at();

drop trigger if exists tiara_post_tags_catalog_touch_updated_at on public.tiara_post_tags_catalog;
create trigger tiara_post_tags_catalog_touch_updated_at
before update on public.tiara_post_tags_catalog
for each row execute function public.tiara_touch_updated_at();

drop trigger if exists tiara_cart_items_touch_updated_at on public.tiara_cart_items;
create trigger tiara_cart_items_touch_updated_at
before update on public.tiara_cart_items
for each row execute function public.tiara_touch_updated_at();

insert into public.tiara_brands (id, name, slug)
values
  ('brand-dot-and-key', 'Dot & Key', 'dot-and-key'),
  ('brand-kay-beauty', 'Kay Beauty', 'kay-beauty'),
  ('brand-minimalist', 'Minimalist', 'minimalist'),
  ('brand-the-ordinary', 'The Ordinary', 'the-ordinary'),
  ('brand-anomaly', 'Anomaly', 'anomaly'),
  ('brand-sol-de-janeiro', 'Sol de Janeiro', 'sol-de-janeiro')
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug;

update public.tiara_products
set "brandId" = case brand
  when 'Dot & Key' then 'brand-dot-and-key'
  when 'Kay Beauty' then 'brand-kay-beauty'
  when 'Minimalist' then 'brand-minimalist'
  when 'The Ordinary' then 'brand-the-ordinary'
  when 'Anomaly' then 'brand-anomaly'
  when 'Sol de Janeiro' then 'brand-sol-de-janeiro'
  else "brandId"
end,
slug = case id
  when 'product-dot-key-sunscreen' then 'dot-and-key-watermelon-cooling-sunscreen-spf-50'
  when 'product-kay-beauty-concealer' then 'kay-beauty-hydrating-concealer'
  when 'product-minimalist-serum' then 'minimalist-10-niacinamide-face-serum'
  when 'product-ordinary-lip-balm' then 'the-ordinary-squalane-amino-acids-lip-balm'
  when 'product-anomaly-mask' then 'anomaly-bonding-hair-mask'
  when 'product-sdj-mist' then 'sol-de-janeiro-cheirosa-62-perfume-mist'
  else slug
end;

insert into public.tiara_post_tags_catalog (id, label, slug, category)
values
  ('tag-pigmentation', 'Pigmentation', 'pigmentation', 'concern'),
  ('tag-routine-help', 'Routine help', 'routine-help', 'behavior'),
  ('tag-wedding-season', 'Wedding season', 'wedding-season', 'context'),
  ('tag-sunscreen', 'Sunscreen', 'sunscreen', 'category'),
  ('tag-mumbai-humidity', 'Mumbai humidity', 'mumbai-humidity', 'context'),
  ('tag-combination-skin', 'Combination skin', 'combination-skin', 'concern'),
  ('tag-office-makeup', 'Office makeup', 'office-makeup', 'behavior'),
  ('tag-makeup-base', 'Makeup base', 'makeup-base', 'category'),
  ('tag-delhi-heat', 'Delhi heat', 'delhi-heat', 'context'),
  ('tag-haircare', 'Haircare', 'haircare', 'category'),
  ('tag-frizz', 'Frizz', 'frizz', 'concern'),
  ('tag-routine-check', 'Routine check', 'routine-check', 'behavior'),
  ('tag-sensitive-skin', 'Sensitive skin', 'sensitive-skin', 'concern'),
  ('tag-barrier-repair', 'Barrier repair', 'barrier-repair', 'concern'),
  ('tag-help', 'Help', 'help', 'behavior')
on conflict (id) do update set
  label = excluded.label,
  slug = excluded.slug,
  category = excluded.category;

insert into public.tiara_post_product_tags (id, "postId", "productId")
values
  ('post-product-tag-001', 'post-001', 'product-dot-key-sunscreen'),
  ('post-product-tag-002', 'post-002', 'product-minimalist-serum'),
  ('post-product-tag-003', 'post-003', 'product-kay-beauty-concealer'),
  ('post-product-tag-004', 'post-004', 'product-anomaly-mask')
on conflict ("postId", "productId") do nothing;

insert into public.tiara_post_brand_tags (id, "postId", "brandId")
values
  ('post-brand-tag-001', 'post-001', 'brand-dot-and-key'),
  ('post-brand-tag-002', 'post-002', 'brand-minimalist'),
  ('post-brand-tag-003', 'post-003', 'brand-kay-beauty'),
  ('post-brand-tag-004', 'post-004', 'brand-anomaly')
on conflict ("postId", "brandId") do nothing;

insert into public.tiara_post_topic_tags (id, "postId", "tagId")
values
  ('post-topic-tag-001', 'post-001', 'tag-sunscreen'),
  ('post-topic-tag-002', 'post-001', 'tag-mumbai-humidity'),
  ('post-topic-tag-003', 'post-001', 'tag-combination-skin'),
  ('post-topic-tag-004', 'post-002', 'tag-pigmentation'),
  ('post-topic-tag-005', 'post-002', 'tag-routine-help'),
  ('post-topic-tag-006', 'post-002', 'tag-wedding-season'),
  ('post-topic-tag-007', 'post-003', 'tag-office-makeup'),
  ('post-topic-tag-008', 'post-003', 'tag-makeup-base'),
  ('post-topic-tag-009', 'post-003', 'tag-delhi-heat'),
  ('post-topic-tag-010', 'post-004', 'tag-haircare'),
  ('post-topic-tag-011', 'post-004', 'tag-frizz'),
  ('post-topic-tag-012', 'post-004', 'tag-routine-check'),
  ('post-topic-tag-013', 'post-005', 'tag-sensitive-skin'),
  ('post-topic-tag-014', 'post-005', 'tag-barrier-repair'),
  ('post-topic-tag-015', 'post-005', 'tag-help')
on conflict ("postId", "tagId") do nothing;

alter table public.tiara_brands enable row level security;
alter table public.tiara_post_tags_catalog enable row level security;
alter table public.tiara_post_product_tags enable row level security;
alter table public.tiara_post_brand_tags enable row level security;
alter table public.tiara_post_topic_tags enable row level security;
alter table public.tiara_comment_mentions enable row level security;

drop policy if exists "Public read tiara_brands" on public.tiara_brands;
create policy "Public read tiara_brands" on public.tiara_brands for select using (true);

drop policy if exists "Public write tiara_brands" on public.tiara_brands;
create policy "Public write tiara_brands" on public.tiara_brands for all using (true) with check (true);

drop policy if exists "Public read tiara_post_tags_catalog" on public.tiara_post_tags_catalog;
create policy "Public read tiara_post_tags_catalog" on public.tiara_post_tags_catalog for select using (true);

drop policy if exists "Public write tiara_post_tags_catalog" on public.tiara_post_tags_catalog;
create policy "Public write tiara_post_tags_catalog" on public.tiara_post_tags_catalog for all using (true) with check (true);

drop policy if exists "Public read tiara_post_product_tags" on public.tiara_post_product_tags;
create policy "Public read tiara_post_product_tags" on public.tiara_post_product_tags for select using (true);

drop policy if exists "Public write tiara_post_product_tags" on public.tiara_post_product_tags;
create policy "Public write tiara_post_product_tags" on public.tiara_post_product_tags for all using (true) with check (true);

drop policy if exists "Public read tiara_post_brand_tags" on public.tiara_post_brand_tags;
create policy "Public read tiara_post_brand_tags" on public.tiara_post_brand_tags for select using (true);

drop policy if exists "Public write tiara_post_brand_tags" on public.tiara_post_brand_tags;
create policy "Public write tiara_post_brand_tags" on public.tiara_post_brand_tags for all using (true) with check (true);

drop policy if exists "Public read tiara_post_topic_tags" on public.tiara_post_topic_tags;
create policy "Public read tiara_post_topic_tags" on public.tiara_post_topic_tags for select using (true);

drop policy if exists "Public write tiara_post_topic_tags" on public.tiara_post_topic_tags;
create policy "Public write tiara_post_topic_tags" on public.tiara_post_topic_tags for all using (true) with check (true);

drop policy if exists "Public read tiara_comment_mentions" on public.tiara_comment_mentions;
create policy "Public read tiara_comment_mentions" on public.tiara_comment_mentions for select using (true);

drop policy if exists "Public write tiara_comment_mentions" on public.tiara_comment_mentions;
create policy "Public write tiara_comment_mentions" on public.tiara_comment_mentions for all using (true) with check (true);

drop policy if exists "Public update tiara_comments" on public.tiara_comments;
create policy "Public update tiara_comments" on public.tiara_comments for update using (true) with check (true);

drop policy if exists "Public update tiara_posts" on public.tiara_posts;
create policy "Public update tiara_posts" on public.tiara_posts for update using (true) with check (true);

drop policy if exists "Public update tiara_products" on public.tiara_products;
create policy "Public update tiara_products" on public.tiara_products for update using (true) with check (true);

create or replace function public.tiara_refresh_product_discussion_count(p_product_id text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.tiara_products
  set "discussionCount" = (
    select count(distinct ppt."postId")
    from public.tiara_post_product_tags ppt
    where ppt."productId" = p_product_id
  )
  where id = p_product_id;
$$;

create or replace function public.tiara_create_post(
  p_id text,
  p_author_id text,
  p_type text,
  p_title text,
  p_description text,
  p_image text,
  p_primary_product_id text default null,
  p_primary_brand_id text default null,
  p_post_tags jsonb default '[]'::jsonb,
  p_product_tags jsonb default '[]'::jsonb,
  p_brand_tags jsonb default '[]'::jsonb
)
returns public.tiara_posts
language plpgsql
security definer
set search_path = public
as $$
declare
  new_post public.tiara_posts;
  tag_value text;
  topic_id text;
begin
  insert into public.tiara_posts (
    id, "authorId", "productId", brand, type, title, description, image, tags, upvotes, "commentCount", "createdAt", "updatedAt"
  )
  values (
    p_id,
    p_author_id,
    p_primary_product_id,
    case
      when p_primary_brand_id is not null then (select name from public.tiara_brands where id = p_primary_brand_id)
      else null
    end,
    p_type,
    p_title,
    p_description,
    p_image,
    coalesce(p_post_tags, '[]'::jsonb),
    1,
    0,
    now(),
    now()
  )
  returning * into new_post;

  if p_primary_product_id is not null then
    insert into public.tiara_post_product_tags (id, "postId", "productId")
    values (gen_random_uuid()::text, p_id, p_primary_product_id)
    on conflict ("postId", "productId") do nothing;
  end if;

  if p_primary_brand_id is not null then
    insert into public.tiara_post_brand_tags (id, "postId", "brandId")
    values (gen_random_uuid()::text, p_id, p_primary_brand_id)
    on conflict ("postId", "brandId") do nothing;
  end if;

  for tag_value in select jsonb_array_elements_text(coalesce(p_product_tags, '[]'::jsonb))
  loop
    insert into public.tiara_post_product_tags (id, "postId", "productId")
    values (gen_random_uuid()::text, p_id, tag_value)
    on conflict ("postId", "productId") do nothing;
    perform public.tiara_refresh_product_discussion_count(tag_value);
  end loop;

  for tag_value in select jsonb_array_elements_text(coalesce(p_brand_tags, '[]'::jsonb))
  loop
    insert into public.tiara_post_brand_tags (id, "postId", "brandId")
    values (gen_random_uuid()::text, p_id, tag_value)
    on conflict ("postId", "brandId") do nothing;
  end loop;

  for tag_value in select jsonb_array_elements_text(coalesce(p_post_tags, '[]'::jsonb))
  loop
    select id into topic_id
    from public.tiara_post_tags_catalog
    where lower(label) = lower(tag_value)
    limit 1;

    if topic_id is null then
      topic_id := 'tag-' || lower(regexp_replace(tag_value, '[^a-zA-Z0-9]+', '-', 'g'));
      insert into public.tiara_post_tags_catalog (id, label, slug, category)
      values (topic_id, tag_value, replace(topic_id, 'tag-', ''), 'topic')
      on conflict (id) do update set
        label = excluded.label,
        slug = excluded.slug;
    end if;

    insert into public.tiara_post_topic_tags (id, "postId", "tagId")
    values (gen_random_uuid()::text, p_id, topic_id)
    on conflict ("postId", "tagId") do nothing;
  end loop;

  return new_post;
end;
$$;

create or replace function public.tiara_create_comment(
  p_id text,
  p_post_id text,
  p_author_id text,
  p_body text,
  p_parent_id text default null,
  p_mentions jsonb default '[]'::jsonb
)
returns public.tiara_comments
language plpgsql
security definer
set search_path = public
as $$
declare
  new_comment public.tiara_comments;
  mention_record jsonb;
begin
  insert into public.tiara_comments (
    id, "postId", "authorId", body, upvotes, "createdAt", "updatedAt", "parentId"
  )
  values (
    p_id, p_post_id, p_author_id, p_body, 0, now(), now(), p_parent_id
  )
  returning * into new_comment;

  update public.tiara_posts
  set "commentCount" = "commentCount" + 1
  where id = p_post_id;

  for mention_record in select jsonb_array_elements(coalesce(p_mentions, '[]'::jsonb))
  loop
    insert into public.tiara_comment_mentions (
      id, "commentId", "entityType", "productId", "brandId", label
    )
    values (
      gen_random_uuid()::text,
      p_id,
      mention_record->>'entityType',
      nullif(mention_record->>'productId', ''),
      nullif(mention_record->>'brandId', ''),
      coalesce(mention_record->>'label', '')
    );
  end loop;

  return new_comment;
end;
$$;

create or replace function public.tiara_upvote_comment(
  p_comment_id text
)
returns public.tiara_comments
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_comment public.tiara_comments;
begin
  update public.tiara_comments
  set upvotes = upvotes + 1
  where id = p_comment_id
  returning * into updated_comment;

  return updated_comment;
end;
$$;

create or replace function public.tiara_add_to_cart(
  p_id text,
  p_user_id text,
  p_product_id text,
  p_quantity integer default 1
)
returns public.tiara_cart_items
language plpgsql
security definer
set search_path = public
as $$
declare
  cart_row public.tiara_cart_items;
begin
  insert into public.tiara_cart_items (id, "userId", "productId", quantity, "updatedAt")
  values (p_id, p_user_id, p_product_id, greatest(p_quantity, 1), now())
  on conflict ("userId", "productId")
  do update set
    quantity = public.tiara_cart_items.quantity + excluded.quantity,
    "updatedAt" = now()
  returning * into cart_row;

  return cart_row;
end;
$$;

create or replace function public.tiara_search_products(
  p_query text,
  p_limit integer default 8
)
returns table (
  id text,
  name text,
  brand text,
  slug text
)
language sql
security definer
set search_path = public
as $$
  select p.id, p.name, p.brand, p.slug
  from public.tiara_products p
  where lower(p.name) like lower(p_query) || '%'
     or lower(p.brand) like lower(p_query) || '%'
     or lower(p.name) like '%' || lower(p_query) || '%'
  order by
    case when lower(p.name) like lower(p_query) || '%' then 0 else 1 end,
    similarity(lower(p.name), lower(p_query)) desc,
    p.name asc
  limit p_limit;
$$;

create or replace function public.tiara_search_brands(
  p_query text,
  p_limit integer default 8
)
returns table (
  id text,
  name text,
  slug text
)
language sql
security definer
set search_path = public
as $$
  select b.id, b.name, b.slug
  from public.tiara_brands b
  where lower(b.name) like lower(p_query) || '%'
     or lower(b.name) like '%' || lower(p_query) || '%'
  order by
    case when lower(b.name) like lower(p_query) || '%' then 0 else 1 end,
    similarity(lower(b.name), lower(p_query)) desc,
    b.name asc
  limit p_limit;
$$;

create or replace function public.tiara_search_post_tags(
  p_query text,
  p_limit integer default 8
)
returns table (
  id text,
  label text,
  slug text,
  category text
)
language sql
security definer
set search_path = public
as $$
  select t.id, t.label, t.slug, t.category
  from public.tiara_post_tags_catalog t
  where lower(t.label) like lower(p_query) || '%'
     or lower(t.label) like '%' || lower(p_query) || '%'
  order by
    case when lower(t.label) like lower(p_query) || '%' then 0 else 1 end,
    similarity(lower(t.label), lower(p_query)) desc,
    t.label asc
  limit p_limit;
$$;

create or replace function public.tiara_search_mentions(
  p_query text,
  p_limit integer default 8
)
returns table (
  entity_type text,
  entity_id text,
  label text,
  slug text
)
language sql
security definer
set search_path = public
as $$
  (
    select 'product'::text, p.id, p.name, p.slug
    from public.tiara_products p
    where lower(p.name) like lower(p_query) || '%'
       or lower(p.brand) like lower(p_query) || '%'
  )
  union all
  (
    select 'brand'::text, b.id, b.name, b.slug
    from public.tiara_brands b
    where lower(b.name) like lower(p_query) || '%'
  )
  limit p_limit;
$$;

grant execute on function public.tiara_refresh_product_discussion_count(text) to anon, authenticated;
grant execute on function public.tiara_create_post(text, text, text, text, text, text, text, text, jsonb, jsonb, jsonb) to anon, authenticated;
grant execute on function public.tiara_create_comment(text, text, text, text, text, jsonb) to anon, authenticated;
grant execute on function public.tiara_upvote_comment(text) to anon, authenticated;
grant execute on function public.tiara_add_to_cart(text, text, text, integer) to anon, authenticated;
grant execute on function public.tiara_search_products(text, integer) to anon, authenticated;
grant execute on function public.tiara_search_brands(text, integer) to anon, authenticated;
grant execute on function public.tiara_search_post_tags(text, integer) to anon, authenticated;
grant execute on function public.tiara_search_mentions(text, integer) to anon, authenticated;
