-- 종합반 — 한 반(organizations) 이 여러 과목(subjects) 을 가질 수 있도록 many-to-many.
-- 기존 organizations.subject_id 데이터는 junction 으로 옮기고 컬럼 drop.

create table if not exists organization_subjects (
  organization_id uuid not null references organizations(id) on delete cascade,
  subject_id uuid not null references subjects(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (organization_id, subject_id)
);

create index if not exists organization_subjects_org_idx
  on organization_subjects(organization_id);
create index if not exists organization_subjects_subject_idx
  on organization_subjects(subject_id);

insert into organization_subjects(organization_id, subject_id)
select id, subject_id from organizations
where subject_id is not null
on conflict do nothing;

alter table organizations drop column if exists subject_id;

alter table organization_subjects disable row level security;
