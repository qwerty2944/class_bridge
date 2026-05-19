-- 수업 과제 시스템 통합:
-- 수업의 별도 "과제 메모/마감/XP" + 출결의 homework_done 체크박스 시스템을 제거하고,
-- 모든 과제 흐름을 assignments + assignment_submissions 한 곳으로 합친다.
-- 데이터 백필 없이 컬럼만 drop (초기 단계).
-- reward_events.source 의 'homework_check' enum 값은 과거 이벤트 보존을 위해 유지.

alter table class_sessions drop column if exists homework_md;
alter table class_sessions drop column if exists homework_xp;
alter table class_sessions drop column if exists homework_due_at;
alter table attendances drop column if exists homework_done;
