-- Class Bridge 담임/부담임 등급
-- 한 반에 선생님 여러 명을 둘 수 있고, 각자 담임(homeroom)/부담임(assistant) 등급을 가진다.
-- 학생 행은 teacher_role 이 null.

alter table organization_members
  add column if not exists teacher_role text
  check (teacher_role is null or teacher_role in ('homeroom','assistant'));

-- 기존 선생님 행은 모두 담임으로 간주
update organization_members set teacher_role = 'homeroom'
  where role = 'teacher' and teacher_role is null;
