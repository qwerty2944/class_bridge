-- Class Bridge 초기 스키마
-- ACA2000 스타일 학원 관리 시스템 (멀티테넌트 · 다대다 역할 매핑)
-- RLS는 명시적으로 비활성화 (사용자 지시)

create extension if not exists "pgcrypto";

-- =====================
-- 1. 테넌트 + 회원
-- =====================
create table if not exists tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  type text not null default 'academy' check (type in ('academy','tutor')),
  invite_code text unique,
  created_at timestamptz not null default now()
);

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists tenant_members (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role text not null check (role in ('director','teacher','student','parent')),
  status text not null default 'active' check (status in ('active','invited','left')),
  joined_at timestamptz not null default now(),
  unique (tenant_id, user_id, role)
);

create index if not exists tenant_members_user_idx on tenant_members(user_id);
create index if not exists tenant_members_tenant_idx on tenant_members(tenant_id);

-- =====================
-- 2. 조직 (반/그룹)
-- =====================
create table if not exists subjects (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  color text default '#6366f1',
  description text,
  created_at timestamptz not null default now()
);
create index if not exists subjects_tenant_idx on subjects(tenant_id);

create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  description text,
  subject_id uuid references subjects(id) on delete set null,
  color text default '#3b82f6',
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists organizations_tenant_idx on organizations(tenant_id);

create table if not exists organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role text not null check (role in ('teacher','student')),
  joined_at timestamptz not null default now(),
  unique (organization_id, user_id, role)
);
create index if not exists organization_members_org_idx on organization_members(organization_id);
create index if not exists organization_members_user_idx on organization_members(user_id);

create table if not exists parent_student_links (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  parent_user_id uuid not null references profiles(id) on delete cascade,
  student_user_id uuid not null references profiles(id) on delete cascade,
  relation text default 'guardian' check (relation in ('father','mother','guardian')),
  created_at timestamptz not null default now(),
  unique (tenant_id, parent_user_id, student_user_id)
);

-- =====================
-- 3. 학사: 수업/출결/과제/진도
-- =====================
create table if not exists class_sessions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  subject_id uuid references subjects(id) on delete set null,
  teacher_id uuid references profiles(id) on delete set null,
  session_date date not null,
  start_time time,
  end_time time,
  topic text,
  content_md text,
  homework_md text,
  created_at timestamptz not null default now()
);
create index if not exists class_sessions_org_date_idx on class_sessions(organization_id, session_date desc);

create table if not exists attendances (
  id uuid primary key default gen_random_uuid(),
  class_session_id uuid not null references class_sessions(id) on delete cascade,
  student_id uuid not null references profiles(id) on delete cascade,
  status text not null default 'present' check (status in ('present','absent','late','excused')),
  check_in_at timestamptz,
  note text,
  unique (class_session_id, student_id)
);
create index if not exists attendances_student_idx on attendances(student_id);

create table if not exists assignments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  subject_id uuid references subjects(id) on delete set null,
  title text not null,
  description_md text,
  due_at timestamptz,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists assignments_org_idx on assignments(organization_id, due_at desc);

create table if not exists assignment_submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references assignments(id) on delete cascade,
  student_id uuid not null references profiles(id) on delete cascade,
  submitted_at timestamptz,
  content_md text,
  file_url text,
  score numeric,
  feedback_md text,
  status text not null default 'pending' check (status in ('pending','submitted','graded')),
  unique (assignment_id, student_id)
);
create index if not exists submissions_student_idx on assignment_submissions(student_id);

create table if not exists progress_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  subject_id uuid references subjects(id) on delete set null,
  record_date date not null,
  chapter text,
  page_from int,
  page_to int,
  content_md text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists progress_org_date_idx on progress_records(organization_id, record_date desc);

-- =====================
-- 4. 게시판
-- =====================
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  organization_id uuid references organizations(id) on delete cascade,
  author_id uuid references profiles(id) on delete set null,
  title text not null,
  content_md text,
  category text not null default 'free' check (category in ('notice','free','qna')),
  pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists posts_tenant_idx on posts(tenant_id, created_at desc);
create index if not exists posts_org_idx on posts(organization_id, created_at desc);

create table if not exists post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  author_id uuid references profiles(id) on delete set null,
  content text not null,
  created_at timestamptz not null default now()
);
create index if not exists post_comments_post_idx on post_comments(post_id, created_at);

-- =====================
-- 5. 트리거: auth.users → profiles 자동 생성
-- =====================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================
-- 6. RLS 비활성화 (사용자 지시)
-- =====================
alter table tenants disable row level security;
alter table profiles disable row level security;
alter table tenant_members disable row level security;
alter table subjects disable row level security;
alter table organizations disable row level security;
alter table organization_members disable row level security;
alter table parent_student_links disable row level security;
alter table class_sessions disable row level security;
alter table attendances disable row level security;
alter table assignments disable row level security;
alter table assignment_submissions disable row level security;
alter table progress_records disable row level security;
alter table posts disable row level security;
alter table post_comments disable row level security;

-- =====================
-- 7. 헬퍼: 초대코드 자동 생성
-- =====================
create or replace function public.generate_invite_code() returns text language sql as $$
  select upper(substring(md5(random()::text || clock_timestamp()::text), 1, 8));
$$;

create or replace function public.set_default_invite_code() returns trigger language plpgsql as $$
begin
  if new.invite_code is null then
    new.invite_code := public.generate_invite_code();
  end if;
  return new;
end; $$;

drop trigger if exists tenants_invite_code on tenants;
create trigger tenants_invite_code
  before insert on tenants
  for each row execute function public.set_default_invite_code();
