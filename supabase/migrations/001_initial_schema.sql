-- 부모 프로필
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz default now() not null
);

-- 아이
create table if not exists children (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  age int not null check (age between 1 and 18),
  interests text[] default '{}',
  created_at timestamptz default now() not null
);

-- 미션
create table if not exists missions (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  title text not null,
  description text not null default '',
  steps jsonb not null default '[]',
  status text not null default 'suggested' check (status in ('suggested', 'in_progress', 'completed')),
  result_photo text,
  result_memo text,
  created_at timestamptz default now() not null,
  completed_at timestamptz
);

-- AI 대화
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  mission_id uuid references missions(id) on delete set null,
  messages jsonb not null default '[]',
  created_at timestamptz default now() not null
);

-- RLS 정책
alter table profiles enable row level security;
alter table children enable row level security;
alter table missions enable row level security;
alter table conversations enable row level security;

-- profiles: 본인만 읽기/쓰기
create policy "profiles_select_own" on profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on profiles for insert with check (auth.uid() = id);

-- children: 부모만 접근
create policy "children_select_own" on children for select using (parent_id = auth.uid());
create policy "children_insert_own" on children for insert with check (parent_id = auth.uid());
create policy "children_update_own" on children for update using (parent_id = auth.uid());

-- missions: 아이의 부모만 접근
create policy "missions_select_own" on missions for select
  using (child_id in (select id from children where parent_id = auth.uid()));
create policy "missions_insert_own" on missions for insert
  with check (child_id in (select id from children where parent_id = auth.uid()));
create policy "missions_update_own" on missions for update
  using (child_id in (select id from children where parent_id = auth.uid()));

-- conversations: 아이의 부모만 접근
create policy "conversations_select_own" on conversations for select
  using (child_id in (select id from children where parent_id = auth.uid()));
create policy "conversations_insert_own" on conversations for insert
  with check (child_id in (select id from children where parent_id = auth.uid()));
create policy "conversations_update_own" on conversations for update
  using (child_id in (select id from children where parent_id = auth.uid()));

-- 프로필 자동 생성 트리거
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
