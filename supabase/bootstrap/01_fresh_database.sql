-- WishFly fresh Supabase bootstrap.
-- Run once on an empty Supabase project from SQL Editor.

begin;

create type public.app_role as enum ('admin', 'user');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz default now(),
  unique (user_id, role)
);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'full_name',
      split_part(new.email, '@', 1)
    )
  )
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'user')
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  img text,
  bg text,
  "order" integer default 0,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.templates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category_id uuid references public.categories(id) on delete set null,
  pages integer default 0,
  badge text,
  label text,
  sub text,
  photo text,
  price numeric default 0,
  discount_price numeric default 0,
  is_premium boolean default false,
  "order" integer default 0,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

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
  views integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.wish_photos (
  id uuid primary key default gen_random_uuid(),
  wish_id uuid not null references public.wishes(id) on delete cascade,
  url text not null,
  "order" integer default 0,
  created_at timestamptz default now()
);

create table public.media_library (
  id uuid primary key default gen_random_uuid(),
  title text,
  url text not null,
  type text,
  tags text,
  attribution text,
  storage_path text,
  file_size bigint,
  mime_type text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  wish_id uuid not null references public.wishes(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  name text,
  message text,
  reaction text,
  moderation_status text not null default 'approved',
  is_spam boolean not null default false,
  moderated_at timestamptz,
  moderated_by uuid references auth.users(id),
  created_at timestamptz default now()
);

create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  template_id uuid references public.templates(id) on delete set null,
  amount numeric not null,
  status text default 'completed',
  created_at timestamptz default now()
);

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  price numeric(10, 2) not null default 0,
  currency text not null default 'INR',
  billing_period text not null default 'monthly',
  is_active boolean not null default true,
  is_visible boolean not null default true,
  display_order integer not null default 0,
  features jsonb not null default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  description text,
  discount_type text not null default 'percentage',
  discount_value numeric(10, 2) not null default 0,
  minimum_amount numeric(10, 2) not null default 0,
  maximum_discount numeric(10, 2),
  starts_at timestamptz default now(),
  expires_at timestamptz,
  usage_limit integer,
  usage_count integer not null default 0,
  per_user_limit integer default 1,
  is_active boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.website_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

create table public.system_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

create table public.ai_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

create index idx_wishes_slug on public.wishes(slug);
create index idx_wishes_user_id on public.wishes(user_id);
create index idx_wishes_template_id on public.wishes(template_id);
create index idx_wish_photos_wish_id on public.wish_photos(wish_id);
create index idx_comments_wish_id on public.comments(wish_id);
create index idx_comments_created_at on public.comments(created_at desc);
create index idx_purchases_user_id on public.purchases(user_id);
create index idx_user_roles_user_id on public.user_roles(user_id);
create unique index purchases_user_template_completed_idx
  on public.purchases (user_id, template_id)
  where status in ('completed', 'claimed');

create or replace function public.increment_wish_view(wish_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.wishes
  set views = coalesce(views, 0) + 1
  where id = wish_id;
end;
$$;

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.categories enable row level security;
alter table public.templates enable row level security;
alter table public.wishes enable row level security;
alter table public.wish_photos enable row level security;
alter table public.media_library enable row level security;
alter table public.comments enable row level security;
alter table public.purchases enable row level security;
alter table public.plans enable row level security;
alter table public.coupons enable row level security;
alter table public.website_settings enable row level security;
alter table public.system_settings enable row level security;
alter table public.ai_settings enable row level security;

create policy "Users can read own profile"
  on public.profiles for select to authenticated
  using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

create policy "Users can read own roles"
  on public.user_roles for select to authenticated
  using (auth.uid() = user_id);

create policy "Categories are viewable by everyone"
  on public.categories for select to anon, authenticated
  using (true);
create policy "Admins can manage categories"
  on public.categories for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Templates are viewable by everyone"
  on public.templates for select to anon, authenticated
  using (true);
create policy "Admins can manage templates"
  on public.templates for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Wishes are viewable by owner or publicly"
  on public.wishes for select to anon, authenticated
  using (auth.uid() = user_id or password_hash is null);
create policy "Users can create their own wishes"
  on public.wishes for insert to authenticated
  with check (auth.uid() = user_id);
create policy "Users can update their own wishes"
  on public.wishes for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their own wishes"
  on public.wishes for delete to authenticated
  using (auth.uid() = user_id);

create policy "Visible wish photos are viewable"
  on public.wish_photos for select to anon, authenticated
  using (exists (select 1 from public.wishes where wishes.id = wish_photos.wish_id));
create policy "Users can manage own wish photos"
  on public.wish_photos for all to authenticated
  using (exists (
    select 1 from public.wishes
    where wishes.id = wish_photos.wish_id and wishes.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.wishes
    where wishes.id = wish_photos.wish_id and wishes.user_id = auth.uid()
  ));

create policy "Media metadata is publicly readable"
  on public.media_library for select to anon, authenticated
  using (true);
create policy "Admins can manage media library"
  on public.media_library for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Approved comments are publicly readable"
  on public.comments for select to anon, authenticated
  using (
    moderation_status = 'approved'
    and exists (select 1 from public.wishes where wishes.id = comments.wish_id)
  );
create policy "Wish owners can read all comments"
  on public.comments for select to authenticated
  using (exists (
    select 1 from public.wishes
    where wishes.id = comments.wish_id and wishes.user_id = auth.uid()
  ));
create policy "Visible wishes accept comments"
  on public.comments for insert to anon, authenticated
  with check (exists (select 1 from public.wishes where wishes.id = comments.wish_id));
create policy "Admins can manage comments"
  on public.comments for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Users can view own purchases"
  on public.purchases for select to authenticated
  using (auth.uid() = user_id);

create policy "Public can view active plans"
  on public.plans for select to anon, authenticated
  using (is_active = true and is_visible = true);
create policy "Admins can manage plans"
  on public.plans for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Public can check active coupons"
  on public.coupons for select to anon, authenticated
  using (is_active = true);
create policy "Admins can manage coupons"
  on public.coupons for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Public can view website settings"
  on public.website_settings for select to anon, authenticated
  using (true);
create policy "Admins can manage website settings"
  on public.website_settings for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Public can view safe system settings"
  on public.system_settings for select to anon, authenticated
  using (key not in ('smtp_password', 'db_password', 'internal_secret'));
create policy "Admins can manage system settings"
  on public.system_settings for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Public can view safe AI settings"
  on public.ai_settings for select to anon, authenticated
  using (key not in ('api_key', 'secret_key', 'provider_token'));
create policy "Admins can manage AI settings"
  on public.ai_settings for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

grant select, update on public.profiles to authenticated;
grant select on public.user_roles to authenticated;
grant select on public.categories, public.templates to anon, authenticated;
grant select, insert, update, delete on public.wishes, public.wish_photos to authenticated;
grant select on public.wishes, public.wish_photos to anon;
grant select on public.media_library to anon, authenticated;
grant select, insert on public.comments to anon, authenticated;
grant select on public.purchases to authenticated;
grant select on public.plans, public.coupons, public.website_settings, public.system_settings, public.ai_settings to anon, authenticated;
grant insert, update, delete on public.categories, public.templates, public.media_library, public.comments, public.plans, public.coupons, public.website_settings, public.system_settings, public.ai_settings to authenticated;

grant all on public.profiles, public.user_roles, public.categories, public.templates,
  public.wishes, public.wish_photos, public.media_library, public.comments,
  public.purchases, public.plans, public.coupons, public.website_settings,
  public.system_settings, public.ai_settings to service_role;

revoke all on function public.has_role(uuid, public.app_role) from public, anon;
grant execute on function public.has_role(uuid, public.app_role) to authenticated, service_role;
revoke all on function public.handle_new_user() from public, anon, authenticated;
grant execute on function public.handle_new_user() to service_role;
grant execute on function public.increment_wish_view(uuid) to anon, authenticated, service_role;

insert into storage.buckets (id, name, public)
values ('media-library', 'media-library', false)
on conflict (id) do nothing;

create policy "Admins can manage media-library objects"
  on storage.objects for all to authenticated
  using (bucket_id = 'media-library' and public.has_role(auth.uid(), 'admin'))
  with check (bucket_id = 'media-library' and public.has_role(auth.uid(), 'admin'));
create policy "Authenticated users can read media-library objects"
  on storage.objects for select to authenticated
  using (bucket_id = 'media-library');

insert into public.website_settings (key, value)
values ('general', '{"site_name":"WishFly","tagline":"Personalized Greeting Experiences"}'::jsonb);
insert into public.system_settings (key, value)
values ('features', '{"registration_enabled":true,"comments_enabled":true}'::jsonb);
insert into public.ai_settings (key, value)
values ('config', '{"enabled":true,"default_provider":"openai"}'::jsonb);
insert into public.plans (name, slug, price, currency, billing_period, features, display_order)
values
  ('Basic', 'basic', 0, 'INR', 'monthly', '["Limited wishes","Basic templates"]'::jsonb, 1),
  ('Premium', 'premium', 499, 'INR', 'monthly', '["Unlimited wishes","All templates","AI Generation"]'::jsonb, 2);

commit;
