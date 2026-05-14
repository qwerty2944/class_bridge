'use client';

import { createClient } from '@/shared/api/supabase/client';
import type { ProgressRecord } from '@/shared/types/database';
import type { ProgressWithSubject } from '../model/types';

const sb = () => createClient();

export async function fetchProgress(orgId: string): Promise<ProgressWithSubject[]> {
  const { data, error } = await sb()
    .from('progress_records')
    .select('*, subject:subjects(*)')
    .eq('organization_id', orgId)
    .order('record_date', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ProgressWithSubject[];
}

export async function createProgress(input: Partial<ProgressRecord> & { organization_id: string; record_date: string }) {
  const { data, error } = await sb().from('progress_records').insert(input).select().single();
  if (error) throw error;
  return data as ProgressRecord;
}

export async function updateProgress(id: string, patch: Partial<ProgressRecord>) {
  const { data, error } = await sb().from('progress_records').update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data as ProgressRecord;
}

export async function deleteProgress(id: string) {
  const { error } = await sb().from('progress_records').delete().eq('id', id);
  if (error) throw error;
}
