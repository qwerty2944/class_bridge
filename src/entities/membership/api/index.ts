'use client';

import { createClient } from '@/shared/api/supabase/client';
import type { ParentStudentLink, Profile } from '@/shared/types/database';

const sb = () => createClient();

export async function fetchParentLinks(tenantId: string, parentUserId: string) {
  const { data, error } = await sb()
    .from('parent_student_links')
    .select('*, student:profiles!parent_student_links_student_user_id_fkey(*)')
    .eq('tenant_id', tenantId)
    .eq('parent_user_id', parentUserId);
  if (error) throw error;
  return (data ?? []) as (ParentStudentLink & { student: Profile })[];
}

export async function addParentLink(input: { tenant_id: string; parent_user_id: string; student_user_id: string }) {
  const { data, error } = await sb().from('parent_student_links').insert(input).select().single();
  if (error) throw error;
  return data as ParentStudentLink;
}

export async function removeParentLink(id: string) {
  const { error } = await sb().from('parent_student_links').delete().eq('id', id);
  if (error) throw error;
}
