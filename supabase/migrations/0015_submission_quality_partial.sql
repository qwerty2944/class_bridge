-- 과제 점검에 '햇는데 미흡' 단계 추가 (4단계).
-- 'partial' = xpReward * 0.5 보너스로 awardForGrade 처리.

alter table assignment_submissions
  drop constraint if exists assignment_submissions_quality_check;

alter table assignment_submissions
  add constraint assignment_submissions_quality_check
  check (quality in ('none', 'partial', 'done', 'excellent'));
