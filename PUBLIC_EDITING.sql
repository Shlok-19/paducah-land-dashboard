-- Run this in Supabase Dashboard > SQL Editor if you already created the parcels table.
-- It changes editing from authenticated-only to public update access.

alter table public.parcels enable row level security;

drop policy if exists "authenticated update parcels" on public.parcels;
drop policy if exists "public update parcels" on public.parcels;

create policy "public update parcels"
on public.parcels
for update
to anon, authenticated
using (true)
with check (true);

grant select, update on public.parcels to anon, authenticated;
