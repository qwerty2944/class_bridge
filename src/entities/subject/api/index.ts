'use client';

import { createClient } from '@/shared/api/supabase/client';
import type { Subject } from '@/shared/types/database';

const sb = () => createClient();

export async function fetchSubjects(tenantId: string): Promise<Subject[]> {
  const { data, error } = await sb().from('subjects').select('*').eq('tenant_id', tenantId).order('created_at');
  if (error) throw error;
  return (data ?? []) as Subject[];
}

export async function createSubject(input: { tenant_id: string; name: string; color?: string | null; description?: string | null }) {
  const { data, error } = await sb().from('subjects').insert(input).select().single();
  if (error) throw error;
  return data as Subject;
}

export async function updateSubject(id: string, patch: Partial<Subject>) {
  const { data, error } = await sb().from('subjects').update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data as Subject;
}

export async function deleteSubject(id: string) {
  const { error } = await sb().from('subjects').delete().eq('id', id);
  if (error) throw error;
}
