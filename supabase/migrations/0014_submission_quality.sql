-- 과제 점검에 '안 햇음 / 햇음 / 아주 잘 햇음' 3단계 평가.
-- 기존 boolean 토글로는 한 단계라 보너스 XP 표현이 안 됐다.
-- 'excellent' 는 awardForGrade 호출 시 xpReward * 1.5 로 가중 지급.

alter table assignment_submissions
  add column if not exists quality text not null default 'none'
  check (quality in ('none', 'done', 'excellent'));
