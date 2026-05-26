-- 'study' 타입 추가 — 스터디 모임 / 자율학습 그룹용.
alter table public.tenants drop constraint if exists tenants_type_check;
alter table public.tenants
  add constraint tenants_type_check check (type in ('academy','tutor','study'));
