-- Patch: allow wallet balance updates on tiara_users
-- Required for placeOrder to deduct wallet credits after checkout

drop policy if exists "Public update tiara_users" on public.tiara_users;
create policy "Public update tiara_users"
  on public.tiara_users
  for update
  using (true)
  with check (true);
