import type { CharacterAppearance, CharacterColors } from '@/shared/unity/types';

export interface StudentCharacter {
  id: string;
  tenant_id: string;
  user_id: string;
  name: string | null;
  level: number;
  xp: number;
  coins: number;
  appearance: CharacterAppearance;
  colors: CharacterColors;
  created_at: string;
  updated_at: string;
}

export interface ShopItem {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  category: string;
  asset_key: string;
  payload: Record<string, unknown> | null;
  icon_url: string | null;
  price: number;
  min_level: number;
  created_at: string;
}

export interface InventoryRow {
  id: string;
  character_id: string;
  shop_item_id: string;
  equipped: boolean;
  acquired_at: string;
  item: ShopItem;
}
