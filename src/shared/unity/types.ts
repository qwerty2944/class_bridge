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

export const DEFAULT_APPEARANCE: CharacterAppearance = {
  bodyIndex: 0,
  eyeIndex: 0,
  hairIndex: 0,
  facehairIndex: 0,
  clothIndex: 0,
  armorIndex: 0,
  pantIndex: 0,
  helmetIndex: 0,
  backIndex: 0,
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
