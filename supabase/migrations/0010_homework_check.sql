-- 수업 과제 점검 — 학생별 과제 수행 체크 + 경험치 지급.
-- attendances(수업-학생 행)에 점검 컬럼 추가, class_sessions 에 점검 XP 추가.

alter table class_sessions add column if not exists homework_xp int not null default 0;
alter table attendances add column if not exists homework_done boolean not null default false;

-- reward_events.source 에 'homework_check' 허용
alter table reward_events drop constraint if exists reward_events_source_check;
alter table reward_events add constraint reward_events_source_check
  check (source in ('assignment_grade', 'admin', 'level_bonus', 'homework_check'));
