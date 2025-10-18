-- Projects table
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  domain text not null,
  brand text,
  competitors text[],
  keywords text[],
  created_at timestamptz default now()
);

-- Checks table
create table if not exists checks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) not null,
  engine text check (engine in ('ChatGPT','Gemini','Claude','Perplexity')) not null,
  keyword text not null,
  position int,
  presence boolean,
  answer_snippet text,
  citations_count int,
  observed_urls text[],
  timestamp timestamptz default now()
);

-- RLS: enable row level security on projects and checks
alter table projects enable row level security;
alter table checks enable row level security;

-- POLICY: allow users to insert/select/update/delete their own projects
create policy "users can manage their projects" on projects
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- POLICY: allow users to read checks for projects they own
create policy "users can read checks for own projects" on checks
  using (exists (select 1 from projects p where p.id = checks.project_id and p.user_id = auth.uid()));

-- POLICY: allow users to insert checks only via service role or if they own the project
create policy "users can insert checks for own projects" on checks
  with check (exists (select 1 from projects p where p.id = checks.project_id and p.user_id = auth.uid()));
