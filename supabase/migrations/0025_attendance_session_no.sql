-- 학생별 수업 회차 — 출결 행마다 그 학생의 회차 번호를 저장한다.
-- 회차는 반 멤버별 주기(session_cycle)로 1 → cycle 까지 돌고 다시 1 로 리셋.
-- 기본 주기 8, 시율이네는 4.

alter table organization_members
  add column if not exists session_cycle int not null default 8
  check (session_cycle between 1 and 99);

alter table attendances
  add column if not exists session_no int check (session_no >= 1);

-- 시율이네 — 학생 이름 또는 반 이름에 '시율' 이 들어가면 주기 4.
update organization_members om set session_cycle = 4
  from profiles p, organizations o
  where om.user_id = p.id
    and om.organization_id = o.id
    and om.role = 'student'
    and (p.full_name like '%시율%' or o.name like '%시율%');

-- 기존 출결 백필 — 학생·반별로 수업 날짜순 번호를 매겨 주기로 감는다.
with ranked as (
  select a.id,
         row_number() over (
           partition by a.student_id, s.organization_id
           order by s.session_date, s.start_time nulls last, s.created_at
         ) as rn,
         coalesce(om.session_cycle, 8) as cycle
  from attendances a
  join class_sessions s on s.id = a.class_session_id
  left join organization_members om
    on om.organization_id = s.organization_id and om.user_id = a.student_id
)
update attendances a set session_no = ((r.rn - 1) % r.cycle) + 1
  from ranked r
  where a.id = r.id and a.session_no is null;
