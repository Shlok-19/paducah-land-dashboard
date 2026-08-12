-- Paducah Land Dashboard - Supabase setup
-- Run this once in Supabase Dashboard > SQL Editor.
-- PUBLIC EDITING VERSION: anyone with the dashboard link can update existing parcels.

create table if not exists public.parcels (
  id text primary key,
  owner text not null,
  acres numeric,
  status text not null default 'Pending',
  price_per_acre numeric,
  current_position text,
  next_action text,
  notes text,
  last_updated date,
  updated_at timestamptz not null default now()
);

alter table public.parcels enable row level security;

-- Everyone can view parcel records.
drop policy if exists "public read parcels" on public.parcels;
create policy "public read parcels"
on public.parcels
for select
to anon, authenticated
using (true);

-- Everyone can update EXISTING parcel records.
-- No public insert or delete policy is created.
drop policy if exists "authenticated update parcels" on public.parcels;
drop policy if exists "public update parcels" on public.parcels;
create policy "public update parcels"
on public.parcels
for update
to anon, authenticated
using (true)
with check (true);

grant select, update on public.parcels to anon, authenticated;

insert into public.parcels (id, owner, acres, status)
values
('P01','Riley, Clifton and Mary Lou',1.04,'Pending'),
('P02','Rickman, Gregory D and Sandra A',1.78,'Pending'),
('P03','Russell, Edith M',4.46,'Pending'),
('P04','McReynolds,Clifton and Joy',1.35,'Pending'),
('P05','Broadway, Christine',0.51,'Pending'),
('P06','Horner, J H Jr',2.86,'Pending'),
('P07','French Kimberly',1.14,'Pending'),
('P08','Lanier,Marion S',0.50,'Pending'),
('P09','Tracy Angela',1.10,'Pending'),
('P10','Riley,Billy G and Deborah N',1.96,'Pending'),
('P11','Wilson, Lamar D',0.83,'Pending'),
('P12','Degler, Emmanuel and Jennifer',1.31,'Pending'),
('P13','Booher, Evelyn Louise Estate',3.73,'Pending'),
('P14','GPED Land',682.14,'Pending'),
('P15','GPED Land',29.92,'Pending'),
('P16','Campbell',29.21,'Pending'),
('P17','Labes LLC',152.29,'Pending'),
('P18','Labes LLC',57.11,'Pending'),
('P19','Smith Contracting',90.35,'Pending')
on conflict (id) do nothing;
