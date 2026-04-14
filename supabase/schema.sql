-- =============================================
-- Comunidade – Database Schema & RLS Policies
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. PROFILES
create table if not exists public.profiles (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  username   text unique not null,
  bio        text,
  avatar_url text,
  created_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

-- Anyone can read profiles
create policy "profiles: public read"
  on public.profiles for select
  using (true);

-- Authenticated users can insert their own profile
create policy "profiles: insert own"
  on public.profiles for insert
  with check (auth.uid() = user_id);

-- Authenticated users can update only their own profile
create policy "profiles: update own"
  on public.profiles for update
  using (auth.uid() = user_id);


-- 2. POSTS
create table if not exists public.posts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (user_id) on delete cascade,
  content    text not null,
  image_url  text,
  created_at timestamptz default now() not null
);

alter table public.posts enable row level security;

-- Anyone can read posts
create policy "posts: public read"
  on public.posts for select
  using (true);

-- Authenticated users can insert their own posts
create policy "posts: insert own"
  on public.posts for insert
  with check (auth.uid() = user_id);

-- Only the author can delete their own post
create policy "posts: delete own"
  on public.posts for delete
  using (auth.uid() = user_id);


-- 3. COMMENTS
create table if not exists public.comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.posts (id) on delete cascade,
  user_id    uuid not null references public.profiles (user_id) on delete cascade,
  text       text not null,
  created_at timestamptz default now() not null
);

alter table public.comments enable row level security;

-- Anyone can read comments
create policy "comments: public read"
  on public.comments for select
  using (true);

-- Authenticated users can insert their own comments
create policy "comments: insert own"
  on public.comments for insert
  with check (auth.uid() = user_id);

-- Only the author can delete their own comment
create policy "comments: delete own"
  on public.comments for delete
  using (auth.uid() = user_id);


-- 4. LIKES
create table if not exists public.likes (
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (user_id) on delete cascade,
  primary key (post_id, user_id)
);

alter table public.likes enable row level security;

-- Anyone can read likes (for counts)
create policy "likes: public read"
  on public.likes for select
  using (true);

-- Authenticated users can like (insert)
create policy "likes: insert own"
  on public.likes for insert
  with check (auth.uid() = user_id);

-- Authenticated users can unlike (delete)
create policy "likes: delete own"
  on public.likes for delete
  using (auth.uid() = user_id);


-- 5. FOLLOWS
create table if not exists public.follows (
  follower_id  uuid not null references public.profiles (user_id) on delete cascade,
  following_id uuid not null references public.profiles (user_id) on delete cascade,
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

alter table public.follows enable row level security;

-- Anyone can read follows
create policy "follows: public read"
  on public.follows for select
  using (true);

-- Authenticated users can follow
create policy "follows: insert own"
  on public.follows for insert
  with check (auth.uid() = follower_id);

-- Authenticated users can unfollow
create policy "follows: delete own"
  on public.follows for delete
  using (auth.uid() = follower_id);


-- =============================================
-- STORAGE BUCKETS
-- Run these as well (or create via the dashboard)
-- =============================================

-- Bucket: avatars (public)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Bucket: post-images (public)
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

-- Storage RLS: avatars
create policy "avatars: public read"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars: authenticated upload"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars: owner update"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars: owner delete"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage RLS: post-images
create policy "post-images: public read"
  on storage.objects for select
  using (bucket_id = 'post-images');

create policy "post-images: authenticated upload"
  on storage.objects for insert
  with check (
    bucket_id = 'post-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "post-images: owner delete"
  on storage.objects for delete
  using (
    bucket_id = 'post-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
