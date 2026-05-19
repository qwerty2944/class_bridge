-- Class Bridge 인수인계(teacher handover)
-- 선생님이 다른 선생님에게 반/학생을 넘길 때 인계 메모와 함께 기록을 남긴다.
-- scope='organization' → 반 전체 담임 교체 (organization_members 도 함께 교체)
-- scope='student'      → 특정 학생 한 명 인수인계 (기록 + 메모만)

create table if not exists teacher_handovers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  scope text not null check (scope in ('organization','student')),
  organization_id uuid references organizations(id) on delete cascade,
  student_id uuid references profiles(id) on delete cascade,
  from_teacher_id uuid references profiles(id) on delete set null,
  to_teacher_id uuid not null references profiles(id) on delete cascade,
  memo text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  -- scope 에 맞는 대상 컬럼이 채워졌는지 보장
  check (
    (scope = 'organization' and organization_id is not null) or
    (scope = 'student' and student_id is not null)
  )
);

create index if not exists teacher_handovers_tenant_idx on teacher_handovers(tenant_id, created_at desc);
create index if not exists teacher_handovers_org_idx on teacher_handovers(organization_id);
create index if not exists teacher_handovers_student_idx on teacher_handovers(student_id);

alter table teacher_handovers disable row level security;
