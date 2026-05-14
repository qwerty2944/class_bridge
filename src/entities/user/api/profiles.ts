'use client';

import { createClient } from '@/shared/api/supabase/client';
import type { Profile } from '@/shared/types/database';

const sb = () => createClient();

export async function fetchProfilesByIds(ids: string[]): Promise<Profile[]> {
  if (ids.length === 0) return [];
  const { data, error } = await sb().from('profiles').select('*').in('id', ids);
  if (error) throw error;
  return (data ?? []) as Profile[];
}

export async function searchProfiles(query: string): Promise<Profile[]> {
  if (!query.trim()) return [];
  const { data } = await sb()
    .from('profiles')
    .select('*')
    .or(`email.ilike.%${query}%,full_name.ilike.%${query}%`)
    .limit(10);
  return (data ?? []) as Profile[];
}
