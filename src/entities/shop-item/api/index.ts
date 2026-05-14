'use client';

import { createClient } from '@/shared/api/supabase/client';
import type { ShopItem } from '@/entities/character';

const sb = () => createClient();

export async function fetchShopItems(tenantId: string): Promise<ShopItem[]> {
  const { data, error } = await sb()
    .from('shop_items')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('min_level')
    .order('price');
  if (error) throw error;
  return (data ?? []) as unknown as ShopItem[];
}

export async function createShopItem(input: Omit<ShopItem, 'id' | 'created_at' | 'payload'> & { payload?: Record<string, unknown> }) {
  const { error } = await sb().from('shop_items').insert(input);
  if (error) throw error;
}

export async function deleteShopItem(id: string) {
  const { error } = await sb().from('shop_items').delete().eq('id', id);
  if (error) throw error;
}

export async function purchase(args: { characterId: string; itemId: string; price: number; coins: number }) {
  if (args.coins < args.price) throw new Error('코인이 부족합니다.');
  const { error: invErr } = await sb()
    .from('character_inventory')
    .insert({ character_id: args.characterId, shop_item_id: args.itemId });
  if (invErr && !invErr.message.includes('duplicate')) throw invErr;
  const { error: cErr } = await sb()
    .from('student_characters')
    .update({ coins: args.coins - args.price, updated_at: new Date().toISOString() })
    .eq('id', args.characterId);
  if (cErr) throw cErr;
}
