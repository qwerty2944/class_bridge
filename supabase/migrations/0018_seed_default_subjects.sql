-- 학원 만들면 자주 쓰는 과목을 자동 시드 — 학원장이 매번 손으로 추가할 필요 없게.
-- SUBJECT_PRESETS (src/views/subjects/ui/SubjectsView.tsx) 와 동일한 9개.

create or replace function public.seed_default_subjects(p_tenant_id uuid)
returns void language plpgsql as $$
begin
  insert into subjects (tenant_id, name, color) values
    (p_tenant_id, '국어',   '#ef4444'),
    (p_tenant_id, '영어',   '#0ea5e9'),
    (p_tenant_id, '수학',   '#6366f1'),
    (p_tenant_id, '과학',   '#22c55e'),
    (p_tenant_id, '사회',   '#f59e0b'),
    (p_tenant_id, '한국사', '#a855f7'),
    (p_tenant_id, '한문',   '#14b8a6'),
    (p_tenant_id, '음악',   '#ec4899'),
    (p_tenant_id, '미술',   '#9333ea')
  on conflict do nothing;
end; $$;

-- 과목이 0개인 기존 테넌트에만 시드 (이미 만든 과목 있으면 건드리지 않음).
do $$ declare t record;
begin
  for t in
    select id from tenants
    where not exists (select 1 from subjects where tenant_id = tenants.id)
  loop
    perform public.seed_default_subjects(t.id);
  end loop;
end; $$;

create or replace function public.on_tenant_created_seed_subjects() returns trigger
language plpgsql as $$
begin
  perform public.seed_default_subjects(new.id);
  return new;
end; $$;

drop trigger if exists tenants_seed_subjects on tenants;
create trigger tenants_seed_subjects
  after insert on tenants
  for each row execute function public.on_tenant_created_seed_subjects();
