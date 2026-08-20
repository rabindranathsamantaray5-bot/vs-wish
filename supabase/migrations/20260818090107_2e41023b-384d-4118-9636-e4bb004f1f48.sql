-- 1. Create app_role enum
create type public.app_role as enum ('admin', 'user');

-- 2. Create profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

grant select, update on public.profiles to authenticated;
grant all on public.profiles to service_role;

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- 3. Create user_roles table
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role),
  created_at timestamptz default now()
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

-- 4. Create has_role security definer function
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- 5. Create profile trigger function
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, new.raw_user_meta_data->>'name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. Categories table
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  img text,
  bg text,
  "order" int default 0,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

grant select on public.categories to anon, authenticated;
grant all on public.categories to service_role;

alter table public.categories enable row level security;

create policy "Categories are viewable by everyone"
  on public.categories for select
  to anon, authenticated
  using (true);

create policy "Admins can manage categories"
  on public.categories
  for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- 7. Templates table
create table public.templates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category_id uuid references public.categories(id) on delete set null,
  pages int default 0,
  badge text,
  label text,
  sub text,
  photo text,
  price numeric default 0,
  discount_price numeric default 0,
  is_premium boolean default false,
  "order" int default 0,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

grant select on public.templates to anon, authenticated;
grant all on public.templates to service_role;

alter table public.templates enable row level security;

create policy "Templates are viewable by everyone"
  on public.templates for select
  to anon, authenticated
  using (true);

create policy "Admins can manage templates"
  on public.templates
  for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- 8. Wishes table
create table public.wishes (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  template_id uuid references public.templates(id) on delete set null,
  user_id uuid references auth.users(id) on delete cascade,
  title text,
  recipient text,
  from_name text,
  message text,
  details text,
  theme text,
  cover_url text,
  music_url text,
  video_url text,
  event_date timestamptz,
  password_hash text,
  views int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

grant select on public.wishes to anon, authenticated;
grant insert, update, delete on public.wishes to authenticated;
grant all on public.wishes to service_role;

alter table public.wishes enable row level security;

create policy "Wishes are viewable by owner or publicly if not password protected"
  on public.wishes for select
  to anon, authenticated
  using (
    auth.uid() = user_id 
    or (password_hash is null)
  );

create policy "Users can create their own wishes"
  on public.wishes for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own wishes"
  on public.wishes for update
  to authenticated
  using (auth.uid() = user_id);

-- 9. Wish Photos table
create table public.wish_photos (
  id uuid primary key default gen_random_uuid(),
  wish_id uuid references public.wishes(id) on delete cascade not null,
  url text not null,
  "order" int default 0,
  created_at timestamptz default now()
);

grant select on public.wish_photos to anon, authenticated;
grant insert, update, delete on public.wish_photos to authenticated;
grant all on public.wish_photos to service_role;

alter table public.wish_photos enable row level security;

create policy "Wish photos are viewable by everyone who can see the wish"
  on public.wish_photos for select
  to anon, authenticated
  using (exists (select 1 from public.wishes w where w.id = wish_id));

create policy "Users can manage photos for their own wishes"
  on public.wish_photos for all
  to authenticated
  using (exists (select 1 from public.wishes w where w.id = wish_id and w.user_id = auth.uid()));

-- 10. Media Library table
create table public.media_library (
  id uuid primary key default gen_random_uuid(),
  title text,
  url text not null,
  type text,
  tags text,
  attribution text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

grant select on public.media_library to authenticated;
grant all on public.media_library to service_role;

alter table public.media_library enable row level security;

create policy "Media is viewable by authenticated users"
  on public.media_library for select
  to authenticated
  using (true);

create policy "Admins can manage media library"
  on public.media_library for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- 11. Comments table
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  wish_id uuid references public.wishes(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete set null,
  name text,
  message text,
  reaction text,
  created_at timestamptz default now()
);

grant select, insert on public.comments to anon, authenticated;
grant all on public.comments to service_role;

alter table public.comments enable row level security;

create policy "Comments are viewable by everyone who can see the wish"
  on public.comments for select
  to anon, authenticated
  using (exists (select 1 from public.wishes w where w.id = wish_id));

create policy "Anyone can post a comment to a wish they can see"
  on public.comments for insert
  to anon, authenticated
  with check (exists (select 1 from public.wishes w where w.id = wish_id));

-- 12. Purchases table
create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  template_id uuid references public.templates(id) on delete set null,
  amount numeric not null,
  status text default 'completed',
  created_at timestamptz default now()
);

grant select on public.purchases to authenticated;
grant all on public.purchases to service_role;

alter table public.purchases enable row level security;

create policy "Users can see their own purchases"
  on public.purchases for select
  to authenticated
  using (auth.uid() = user_id);
