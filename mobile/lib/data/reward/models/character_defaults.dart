/// 기본 캐릭터 외형 — 웹 `src/shared/unity/types.ts` DEFAULT_APPEARANCE/COLORS 이식.
/// SPUM Unity 빌드에서 -1 은 '미장착', 0 은 '프리셋 0번'.
const Map<String, dynamic> kDefaultAppearance = {
  'bodyIndex': 0,
  'eyeIndex': 0,
  'hairIndex': -1,
  'facehairIndex': -1,
  'clothIndex': -1,
  'armorIndex': -1,
  'pantIndex': -1,
  'helmetIndex': -1,
  'backIndex': -1,
};

const Map<String, dynamic> kDefaultColors = {
  'body': '#f5d3a3',
  'eye': '#4f46e5',
  'hair': '#222222',
  'facehair': '#222222',
  'cloth': '#3b82f6',
  'armor': '#9ca3af',
  'pant': '#1f2937',
};
