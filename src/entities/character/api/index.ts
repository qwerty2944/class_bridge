'use client';

import { createClient } from '@/shared/api/supabase/client';
import { DEFAULT_APPEARANCE, DEFAULT_COLORS } from '@/shared/unity/types';
import type { StudentCharacter, InventoryRow } from '../model/types';

const sb = () => createClient();

export async function fetchCharacter(tenantId: string, userId: string): Promise<StudentCharacter | null> {
  const { data } = await sb()
    .from('student_characters')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('user_id', userId)
    .maybeSingle();
  return data ? (data as unknown as StudentCharacter) : null;
}

export async function ensureCharacter(args: { tenantId: string; userId: string; fullName?: string | null }): Promise<StudentCharacter> {
  const existing = await fetchCharacter(args.tenantId, args.userId);
  if (existing) return existing;
  const { data, error } = await sb()
    .from('student_characters')
    .insert({
      tenant_id: args.tenantId,
      user_id: args.userId,
      name: args.fullName ?? '내 캐릭터',
      appearance: DEFAULT_APPEARANCE,
      colors: DEFAULT_COLORS,
    })
    .select()
    .single();
  if (error) throw error;
  return data as unknown as StudentCharacter;
}

export async function updateCharacter(id: string, patch: Partial<StudentCharacter>) {
  const { data, error } = await sb()
    .from('student_characters')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as StudentCharacter;
}

export async function fetchInventory(characterId: string): Promise<InventoryRow[]> {
  const { data, error } = await sb()
    .from('character_inventory')
    .select('*, item:shop_items(*)')
    .eq('character_id', characterId)
    .order('acquired_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as InventoryRow[];
}

export async function setEquipped(inventoryId: string, equipped: boolean) {
  const { error } = await sb().from('character_inventory').update({ equipped }).eq('id', inventoryId);
  if (error) throw error;
}

export async function equipExclusive(characterId: string, inventoryId: string, category: string) {
  const { data: items } = await sb()
    .from('character_inventory')
    .select('id, item:shop_items(category)')
    .eq('character_id', characterId);
  const sameCat = ((items ?? []) as { id: string; item?: { category?: string } | null }[]).filter(
    (r) => r.item?.category === category && r.id !== inventoryId,
  );
  if (sameCat.length) {
    await sb()
      .from('character_inventory')
      .update({ equipped: false })
      .in(
        'id',
        sameCat.map((r) => r.id),
      );
  }
  await setEquipped(inventoryId, true);
}
