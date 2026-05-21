-- 퀴즈(시험) 점수 기록 + 유연한 XP 자동 지급.
-- 문제 자체는 시스템 밖(종이/외부)에서 진행. 여기는 점수 대장 + XP 변환 규칙만.

create table if not exists quizzes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  subject_id uuid references subjects(id) on delete set null,
  name text not null,
  quiz_date date not null default current_date,
  max_score int not null default 100 check (max_score > 0),
  -- xp_rule: discriminated union (kind: 'proportional' | 'cutoff' | 'bands')
  --   proportional: { kind, maxXp }                          → round(maxXp × score/max_score)
  --   cutoff:       { kind, threshold, xp }                  → score ≥ threshold ? xp : 0
  --   bands:        { kind, bands: [{ minScore, xp }, ...] } → 내림차순 첫 매치
  xp_rule jsonb not null default jsonb_build_object('kind', 'proportional', 'maxXp', 50),
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists quiz_scores (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references quizzes(id) on delete cascade,
  student_id uuid not null references profiles(id) on delete cascade,
  score int,
  xp_awarded int not null default 0,
  recorded_at timestamptz,
  unique (quiz_id, student_id)
);

create index if not exists quizzes_org_idx on quizzes(organization_id, quiz_date desc);
create index if not exists quiz_scores_quiz_idx on quiz_scores(quiz_id);

alter table quizzes disable row level security;
alter table quiz_scores disable row level security;

-- reward_events.source 에 'quiz' 추가.
alter table reward_events drop constraint if exists reward_events_source_check;
alter table reward_events add constraint reward_events_source_check
  check (source in ('assignment_grade','admin','level_bonus','homework_check','quiz'));
