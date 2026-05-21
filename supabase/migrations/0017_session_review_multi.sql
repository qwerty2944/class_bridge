-- 한 수업이 여러 지난 과제를 점검할 수 있게 — junction table.
-- 기존의 단일 reviewed_assignment_id 컬럼은 이 테이블로 마이그레이션 후 drop.

create table if not exists class_session_reviews (
  session_id uuid not null references class_sessions(id) on delete cascade,
  assignment_id uuid not null references assignments(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (session_id, assignment_id)
);

create index if not exists class_session_reviews_session_idx
  on class_session_reviews(session_id);
create index if not exists class_session_reviews_assignment_idx
  on class_session_reviews(assignment_id);

insert into class_session_reviews(session_id, assignment_id)
select id, reviewed_assignment_id
from class_sessions
where reviewed_assignment_id is not null
on conflict do nothing;

alter table class_sessions drop column if exists reviewed_assignment_id;
