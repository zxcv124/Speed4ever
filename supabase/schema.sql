create extension if not exists pgcrypto;

create table if not exists public.users (
  username text primary key,
  uid uuid not null unique,
  display_name text not null,
  email text,
  phone_number text,
  photo_url text,
  date bigint not null,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  uid uuid not null,
  display_name text not null,
  title text not null,
  qty numeric,
  model text,
  price numeric not null,
  state text,
  shipping_cost text,
  shipping_method text,
  location text,
  duration integer not null,
  description text,
  status text not null default 'Inactive',
  images text[] not null default '{}',
  date bigint not null,
  expires_at bigint,
  closed_at bigint,
  current_bid jsonb,
  winner jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.product_bids (
  product_id uuid not null references public.products(id) on delete cascade,
  username text not null references public.users(username) on delete cascade,
  uid uuid not null,
  price numeric not null,
  date bigint not null,
  created_at timestamptz not null default now(),
  primary key (product_id, username)
);

create table if not exists public.product_comments (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  uid uuid not null,
  display_name text not null,
  comment text not null,
  photo_url text,
  date bigint not null,
  created_at timestamptz not null default now()
);

create table if not exists public.cars (
  id uuid primary key default gen_random_uuid(),
  uid uuid not null,
  display_name text not null,
  owned_by text,
  model_year numeric,
  model text,
  kilometers numeric,
  color text,
  country text,
  facebook text,
  instagram text,
  twitter text,
  snapchat text,
  whatsapp text,
  description text,
  status text not null default 'Inactive',
  images text[] not null default '{}',
  date bigint not null,
  created_at timestamptz not null default now()
);

create table if not exists public.car_comments (
  id uuid primary key default gen_random_uuid(),
  car_id uuid not null references public.cars(id) on delete cascade,
  uid uuid not null,
  display_name text not null,
  comment text not null,
  photo_url text,
  date bigint not null,
  created_at timestamptz not null default now()
);

create table if not exists public.cover (
  id text primary key,
  title text not null,
  link text not null
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  username text not null references public.users(username) on delete cascade,
  type text not null,
  product_id uuid,
  title text,
  payload jsonb not null default '{}',
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;
alter table public.products enable row level security;
alter table public.product_bids enable row level security;
alter table public.product_comments enable row level security;
alter table public.cars enable row level security;
alter table public.car_comments enable row level security;
alter table public.cover enable row level security;
alter table public.notifications enable row level security;

create policy "Users are readable" on public.users for select using (true);
create policy "Users can create own profile" on public.users for insert with check (auth.uid() = uid);
create policy "Users can update own profile" on public.users for update using (auth.uid() = uid) with check (auth.uid() = uid);

create policy "Products are readable" on public.products for select using (true);
create policy "Users can create own products" on public.products for insert with check (auth.uid() = uid);
create policy "Owners can update products" on public.products for update using (auth.uid() = uid) with check (auth.uid() = uid);
create policy "Owners can delete products" on public.products for delete using (auth.uid() = uid);

create policy "Bids are readable" on public.product_bids for select using (true);
create policy "Users can create own bids" on public.product_bids for insert with check (auth.uid() = uid);
create policy "Users can update own bids" on public.product_bids for update using (auth.uid() = uid) with check (auth.uid() = uid);

create policy "Product comments are readable" on public.product_comments for select using (true);
create policy "Users can create own product comments" on public.product_comments for insert with check (auth.uid() = uid);
create policy "Users can update own product comments" on public.product_comments for update using (auth.uid() = uid) with check (auth.uid() = uid);
create policy "Users can delete own product comments" on public.product_comments for delete using (auth.uid() = uid);

create policy "Cars are readable" on public.cars for select using (true);
create policy "Users can create own cars" on public.cars for insert with check (auth.uid() = uid);
create policy "Owners can update cars" on public.cars for update using (auth.uid() = uid) with check (auth.uid() = uid);
create policy "Owners can delete cars" on public.cars for delete using (auth.uid() = uid);

create policy "Car comments are readable" on public.car_comments for select using (true);
create policy "Users can create own car comments" on public.car_comments for insert with check (auth.uid() = uid);
create policy "Users can update own car comments" on public.car_comments for update using (auth.uid() = uid) with check (auth.uid() = uid);
create policy "Users can delete own car comments" on public.car_comments for delete using (auth.uid() = uid);

create policy "Cover is readable" on public.cover for select using (true);

create policy "Users can read own notifications" on public.notifications
  for select using (
    exists (
      select 1 from public.users
      where users.username = notifications.username
      and users.uid = auth.uid()
    )
  );

create policy "Users can update own notifications" on public.notifications
  for update using (
    exists (
      select 1 from public.users
      where users.username = notifications.username
      and users.uid = auth.uid()
    )
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('speed4ever-images', 'speed4ever-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "Images are publicly readable" on storage.objects
  for select using (bucket_id = 'speed4ever-images');

create policy "Users can upload own images" on storage.objects
  for insert with check (
    bucket_id = 'speed4ever-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update own images" on storage.objects
  for update using (
    bucket_id = 'speed4ever-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own images" on storage.objects
  for delete using (
    bucket_id = 'speed4ever-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
