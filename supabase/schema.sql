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
drop policy if exists "Leaderboard is readable by everyone" on public.quiz_attempts;
create policy "Leaderboard is readable by everyone"
  on public.quiz_attempts for select
  using (true);

-- Only authenticated users (Google) can insert their own attempt
drop policy if exists "Authenticated users can insert own attempt" on public.quiz_attempts;
create policy "Authenticated users can insert own attempt"
  on public.quiz_attempts for insert
  with check (auth.uid() = user_id);

-- Leaderboard owner can delete all attempts
drop policy if exists "Leaderboard owner can delete all attempts" on public.quiz_attempts;
create policy "Leaderboard owner can delete all attempts"
  on public.quiz_attempts for delete
  using (lower(auth.jwt() ->> 'email') = 'robby@puresurvey.co.za');

-- Owner-only reset function (bypasses policy drift issues via explicit check)
create or replace function public.clear_all_quiz_results()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_count integer := 0;
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) <> 'robby@puresurvey.co.za' then
    raise exception 'Not authorized';
  end if;

  delete from public.quiz_attempts
  where true;
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

revoke all on function public.clear_all_quiz_results() from public;
grant execute on function public.clear_all_quiz_results() to authenticated;
