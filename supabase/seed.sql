-- 시드 데이터 (수동 테스트용)
-- 사용 전: auth.users에 director@example.com / teacher@example.com / student@example.com / parent@example.com 가입 필요
-- 이 SQL은 학원, 과목, 반, 멤버, 더미 수업/과제 생성

-- 예시 학원
insert into tenants (id, name, slug, type)
values ('11111111-1111-1111-1111-111111111111', '데모 학원', 'demo-academy', 'academy')
on conflict (id) do nothing;

insert into subjects (tenant_id, name, color)
values
  ('11111111-1111-1111-1111-111111111111', '수학', '#6366f1'),
  ('11111111-1111-1111-1111-111111111111', '영어', '#ec4899')
on conflict do nothing;

insert into organizations (id, tenant_id, name, description)
values ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', '수학 심화반 A', '고1 수학 심화')
on conflict (id) do nothing;
