-- 신규 학생 캐릭터의 기본 외형을 '아무것도 없음' 으로.
-- SPUM Unity 빌드에서 idx 0 은 '없음' 이 아니라 '프리셋 0번' (왕관/망토/화염 등이 포함된 풀세트)
-- 이라 캐릭터가 처음 만들어졌을 때 이상한 게 달려 있어 보였다.
-- 몸·눈만 0 유지, 나머지 옵션 파츠는 -1 로 시작 → applyAppearance 가 호출 자체를 생략 = 미장착.

alter table student_characters
  alter column appearance set default jsonb_build_object(
    'bodyIndex', 0,
    'eyeIndex', 0,
    'hairIndex', -1,
    'facehairIndex', -1,
    'clothIndex', -1,
    'armorIndex', -1,
    'pantIndex', -1,
    'helmetIndex', -1,
    'backIndex', -1
  );

-- 기존 행 백필 — 학원이 모두 초기 단계라 사용자가 명시적으로 고른 외형이 거의 없음.
update student_characters
set appearance = jsonb_build_object(
  'bodyIndex', coalesce((appearance->>'bodyIndex')::int, 0),
  'eyeIndex', coalesce((appearance->>'eyeIndex')::int, 0),
  'hairIndex', -1,
  'facehairIndex', -1,
  'clothIndex', -1,
  'armorIndex', -1,
  'pantIndex', -1,
  'helmetIndex', -1,
  'backIndex', -1
);
