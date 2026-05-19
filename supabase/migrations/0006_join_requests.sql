-- 학원 가입 요청 — 학원 검색 후 가입 요청을 보내고 학원장이 승인하는 흐름.
-- 초대코드 즉시 합류는 그대로 유지되며, 이 테이블은 검색 가입 경로에만 쓰인다.

create table if not exists tenant_join_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  requested_role text not null check (requested_role in ('teacher','student','parent')),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  message text,
  decided_by uuid references profiles(id) on delete set null,
  decided_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists join_requests_tenant_idx on tenant_join_requests(tenant_id, status);
create index if not exists join_requests_user_idx on tenant_join_requests(user_id);

alter table tenant_join_requests disable row level security;

-- 학원장 토스트 알림 / 신청자 승인 알림용 Realtime publication 등록
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'tenant_join_requests'
  ) then
    alter publication supabase_realtime add table public.tenant_join_requests;
  end if;
end $$;
