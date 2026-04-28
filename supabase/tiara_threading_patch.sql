alter table public.tiara_comments
  add column if not exists "parentId" text references public.tiara_comments(id) on delete cascade;

create index if not exists tiara_comments_parent_id_idx
  on public.tiara_comments ("parentId");

drop policy if exists "Public update tiara_comments" on public.tiara_comments;
create policy "Public update tiara_comments"
  on public.tiara_comments
  for update
  using (true)
  with check (true);

drop policy if exists "Public update tiara_posts" on public.tiara_posts;
create policy "Public update tiara_posts"
  on public.tiara_posts
  for update
  using (true)
  with check (true);

create or replace function public.tiara_create_comment(
  p_id text,
  p_post_id text,
  p_author_id text,
  p_body text,
  p_parent_id text default null
)
returns public.tiara_comments
language plpgsql
security definer
set search_path = public
as $$
declare
  new_comment public.tiara_comments;
begin
  insert into public.tiara_comments (id, "postId", "authorId", body, upvotes, "createdAt", "parentId")
  values (p_id, p_post_id, p_author_id, p_body, 0, now(), p_parent_id)
  returning * into new_comment;

  update public.tiara_posts
  set "commentCount" = "commentCount" + 1
  where id = p_post_id;

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

grant execute on function public.tiara_create_comment(text, text, text, text, text) to anon, authenticated;
grant execute on function public.tiara_upvote_comment(text) to anon, authenticated;

update public.tiara_comments set "parentId" = null where id in ('comment-001', 'comment-003', 'comment-004');
update public.tiara_comments set "parentId" = 'comment-001' where id = 'comment-002';

insert into public.tiara_comments (id, "postId", "authorId", body, upvotes, "createdAt", "parentId")
values
  (
    'comment-005',
    'post-002',
    'user-tiara-aanya',
    'This makes sense. I would probably keep actives for the evening too so the base stays simple.',
    9,
    '2026-04-28T07:29:00.000Z',
    'comment-003'
  ),
  (
    'comment-006',
    'post-002',
    'user-tiara-naina',
    'Yes, exactly. Morning routine has to survive actual office days, not just mirror selfies.',
    7,
    '2026-04-28T07:41:00.000Z',
    'comment-005'
  )
on conflict (id) do update set
  "postId" = excluded."postId",
  "authorId" = excluded."authorId",
  body = excluded.body,
  upvotes = excluded.upvotes,
  "createdAt" = excluded."createdAt",
  "parentId" = excluded."parentId";
