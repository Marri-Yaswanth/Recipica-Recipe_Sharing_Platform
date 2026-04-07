-- Supabase/PostgreSQL schema for core app flows used by backend routes
-- Run this in Supabase SQL Editor.

create table if not exists public.users (
  id bigserial primary key,
  name text not null,
  email text unique not null,
  password text not null,
  oauth_provider text,
  oauth_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.recipes (
  id bigserial primary key,
  user_id bigint not null references public.users(id) on delete cascade,
  name text not null,
  description text not null,
  ingredients jsonb,
  instructions text not null,
  category text not null,
  diet_type text not null default 'vegetarian' check (diet_type in ('vegetarian', 'eggetarian', 'non-vegetarian')),
  image_url text,
  prep_time integer not null default 0,
  cook_time integer not null default 0,
  servings integer not null default 4,
  status text not null default 'active' check (status in ('active', 'draft', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_recipes_category on public.recipes(category);
create index if not exists idx_recipes_user_id on public.recipes(user_id);
create index if not exists idx_recipes_diet_type on public.recipes(diet_type);

create table if not exists public.likes (
  id bigserial primary key,
  user_id bigint not null references public.users(id) on delete cascade,
  recipe_id bigint not null references public.recipes(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, recipe_id)
);

create index if not exists idx_likes_recipe_id on public.likes(recipe_id);
create index if not exists idx_likes_user_id on public.likes(user_id);
