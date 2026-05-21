-- 새 수업 만들 때 어떤 과거 과제를 점검했는지 기록.
-- 수업 상세 페이지의 PastHomeworkCheck 가 이 컬럼을 prefill 로 사용.

alter table class_sessions
  add column if not exists reviewed_assignment_id uuid
  references assignments(id) on delete set null;

create index if not exists class_sessions_reviewed_assignment_idx
  on class_sessions(reviewed_assignment_id);
