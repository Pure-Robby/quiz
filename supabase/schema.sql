-- Quiz attempts: one row per submission (user_id from Google sign-in; app restricts to @puresurvey.co.za)
create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  display_name text not null,
  score int not null check (score >= 0),
  total int not null check (total > 0),
  gave_up boolean not null default false,
  answers_json jsonb,
  created_at timestamptz not null default now()
);

-- Index for leaderboard: best scores first, then earliest for tie-break
create index if not exists quiz_attempts_leaderboard
  on public.quiz_attempts (score desc, created_at asc);

-- RLS
alter table public.quiz_attempts enable row level security;

-- Anyone can read (for leaderboard)
create policy "Leaderboard is readable by everyone"
  on public.quiz_attempts for select
  using (true);

-- Only authenticated users (Google) can insert their own attempt
create policy "Authenticated users can insert own attempt"
  on public.quiz_attempts for insert
  with check (auth.uid() = user_id);

-- No update/delete for simplicity
-- revoke update, delete on public.quiz_attempts from anon, authenticated;
