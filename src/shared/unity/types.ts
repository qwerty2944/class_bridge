export interface CharacterAppearance {
  bodyIndex: number;
  eyeIndex: number;
  hairIndex: number;
  facehairIndex: number;
  clothIndex: number;
  armorIndex: number;
  pantIndex: number;
  helmetIndex: number;
  backIndex: number;
}

export interface CharacterColors {
  body: string;
  eye: string;
  hair: string;
  facehair: string;
  cloth: string;
  armor: string;
  pant: string;
}

// SPUM Unity 빌드에서 옵션 파츠는 -1 이 '미장착', 0 은 '프리셋 0번' 이다.
// 기본 캐릭터는 몸·눈만 보이고 나머지는 아무것도 없는 상태로 시작 → 사용자가 점차 입혀 나감.
export const DEFAULT_APPEARANCE: CharacterAppearance = {
  bodyIndex: 0,
  eyeIndex: 0,
  hairIndex: -1,
  facehairIndex: -1,
  clothIndex: -1,
  armorIndex: -1,
  pantIndex: -1,
  helmetIndex: -1,
  backIndex: -1,
};

export const DEFAULT_COLORS: CharacterColors = {
  body: '#f5d3a3',
  eye: '#4f46e5',
  hair: '#222222',
  facehair: '#222222',
  cloth: '#3b82f6',
  armor: '#9ca3af',
  pant: '#1f2937',
};

export type ShopCategory =
  | 'hair'
  | 'cloth'
  | 'armor'
  | 'pant'
  | 'helmet'
  | 'back'
  | 'weapon'
  | 'accessory';

export const CATEGORY_TO_APPEARANCE_KEY: Record<
  Exclude<ShopCategory, 'weapon' | 'accessory'>,
  keyof CharacterAppearance
> = {
  hair: 'hairIndex',
  cloth: 'clothIndex',
  armor: 'armorIndex',
  pant: 'pantIndex',
  helmet: 'helmetIndex',
  back: 'backIndex',
};

export const CATEGORY_LABEL_KO: Record<ShopCategory, string> = {
  hair: '헤어',
  cloth: '옷',
  armor: '갑옷',
  pant: '바지',
  helmet: '투구',
  back: '망토',
  weapon: '무기',
  accessory: '장신구',
};
