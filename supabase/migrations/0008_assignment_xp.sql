-- 과제별 경험치 — 선생님이 과제마다 지급할 XP를 직접 정한다.
-- 채점 시 학생에게 이 값만큼 XP가 지급된다(점수 기반 자동 공식 대체).

alter table assignments add column if not exists xp_reward int not null default 0;
