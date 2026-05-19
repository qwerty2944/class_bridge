-- 수업 과제 메모를 과제 목록과 연동 — 수업에 적은 과제가 assignments 에 자동 생성된다.
-- homework_due_at: 수업 폼에서 입력하는 과제 마감일.
-- source_session_id: 자동 생성된 과제가 어느 수업에서 왔는지 (재동기화·식별용).

alter table class_sessions add column if not exists homework_due_at timestamptz;
alter table assignments add column if not exists source_session_id uuid
  references class_sessions(id) on delete cascade;
create index if not exists assignments_source_session_idx on assignments(source_session_id);
