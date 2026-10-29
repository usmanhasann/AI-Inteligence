-- =========================================================
-- Upgrade Myself — Supabase schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- =========================================================

-- Enable RLS on all tables so users can only see their own rows.

-- ── settings ────────────────────────────────────────────────
create table if not exists settings (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  name         text not null default '',
  theme        text not null default 'dark',
  motion       text not null default 'system',
  pace         text not null default 'balanced',
  weekday_min  int  not null default 20,
  weekend_min  int  not null default 120,
  updated_at   timestamptz not null default now()
);
alter table settings enable row level security;
create policy "own settings" on settings using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── progress ────────────────────────────────────────────────
create table if not exists progress (
  user_id       uuid references auth.users(id) on delete cascade,
  concept_id    text,
  learned_at    bigint,
  quiz_best     numeric,
  quiz_attempts int  not null default 0,
  last_seen     bigint,
  note          text,
  updated_at    timestamptz not null default now(),
  primary key (user_id, concept_id)
);
alter table progress enable row level security;
create policy "own progress" on progress using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── activity ────────────────────────────────────────────────
create table if not exists activity (
  user_id   uuid references auth.users(id) on delete cascade,
  date      text,          -- YYYY-MM-DD
  concepts  int not null default 0,
  minutes   int not null default 0,
  reviews   int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, date)
);
alter table activity enable row level security;
create policy "own activity" on activity using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── srs (spaced-repetition) ─────────────────────────────────
create table if not exists srs (
  user_id    uuid references auth.users(id) on delete cascade,
  concept_id text,
  box        int  not null default 1,
  due        bigint not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, concept_id)
);
alter table srs enable row level security;
create policy "own srs" on srs using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── plan ────────────────────────────────────────────────────
create table if not exists plan (
  user_id    uuid references auth.users(id) on delete cascade,
  item_id    text,
  concept_id text not null,
  date       text not null,  -- YYYY-MM-DD
  primary key (user_id, item_id)
);
alter table plan enable row level security;
create policy "own plan" on plan using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── saved (items + collections + weekBest as JSON blobs) ────
create table if not exists saved (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  items       jsonb not null default '{}',
  collections jsonb not null default '[]',
  week_best   jsonb not null default '{}',
  updated_at  timestamptz not null default now()
);
alter table saved enable row level security;
create policy "own saved" on saved using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── packs (imported content packs as a JSON blob) ───────────
create table if not exists packs (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null default '[]',
  updated_at timestamptz not null default now()
);
alter table packs enable row level security;
create policy "own packs" on packs using (auth.uid() = user_id) with check (auth.uid() = user_id);
