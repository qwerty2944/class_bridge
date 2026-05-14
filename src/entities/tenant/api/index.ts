'use client';

import { createClient } from '@/shared/api/supabase/client';
import type { Profile, Role, Tenant, TenantMember } from '@/shared/types/database';

const sb = () => createClient();

export type MemberWithProfile = TenantMember & { profile: Profile };

export async function fetchTenantMembers(tenantId: string): Promise<MemberWithProfile[]> {
  const { data, error } = await sb()
    .from('tenant_members')
    .select('*, profile:profiles(*)')
    .eq('tenant_id', tenantId)
    .eq('status', 'active')
    .order('joined_at');
  if (error) throw error;
  return (data ?? []) as MemberWithProfile[];
}

export async function fetchTenantByInvite(code: string): Promise<Tenant | null> {
  const { data } = await sb().from('tenants').select('*').eq('invite_code', code).maybeSingle();
  return (data as Tenant) ?? null;
}

export async function addTenantMember(args: { tenantId: string; userId: string; role: Role }) {
  const { data, error } = await sb()
    .from('tenant_members')
    .insert({ tenant_id: args.tenantId, user_id: args.userId, role: args.role })
    .select()
    .single();
  if (error) throw error;
  return data as TenantMember;
}

export async function removeTenantMember(memberRowId: string) {
  const { error } = await sb().from('tenant_members').delete().eq('id', memberRowId);
  if (error) throw error;
}

export async function regenerateInviteCode(tenantId: string): Promise<string> {
  const newCode = Array.from({ length: 8 }, () =>
    Math.floor(Math.random() * 36).toString(36),
  )
    .join('')
    .toUpperCase();
  const { error } = await sb().from('tenants').update({ invite_code: newCode }).eq('id', tenantId);
  if (error) throw error;
  return newCode;
}

export async function fetchTenant(tenantId: string) {
  const { data } = await sb().from('tenants').select('*').eq('id', tenantId).maybeSingle();
  return (data as Tenant) ?? null;
}
