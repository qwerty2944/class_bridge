'use client';

import { createClient } from '@/shared/api/supabase/client';
import type { Organization, OrganizationMember, OrgRole } from '@/shared/types/database';
import type { OrgWithSubject, OrgMemberWithProfile } from '../model/types';

const sb = () => createClient();

export async function fetchOrganizations(tenantId: string): Promise<OrgWithSubject[]> {
  const { data, error } = await sb()
    .from('organizations')
    .select('*, subject:subjects(*)')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as OrgWithSubject[];
}

export async function fetchOrganizationsForUser(tenantId: string, userId: string): Promise<OrgWithSubject[]> {
  const { data: rows } = await sb()
    .from('organization_members')
    .select('organization:organizations(*, subject:subjects(*))')
    .eq('user_id', userId);
  const all = ((rows ?? []) as { organization: unknown }[]).map(
    (r) => r.organization as unknown as OrgWithSubject,
  );
  return all.filter((o: OrgWithSubject) => o && o.tenant_id === tenantId);
}

export async function fetchOrganization(id: string): Promise<OrgWithSubject | null> {
  const { data } = await sb().from('organizations').select('*, subject:subjects(*)').eq('id', id).maybeSingle();
  return (data as OrgWithSubject) ?? null;
}

export async function createOrganization(input: {
  tenant_id: string;
  name: string;
  description?: string | null;
  subject_id?: string | null;
  color?: string | null;
  created_by?: string | null;
}) {
  const { data, error } = await sb().from('organizations').insert(input).select().single();
  if (error) throw error;
  return data as Organization;
}

export async function updateOrganization(id: string, patch: Partial<Organization>) {
  const { data, error } = await sb().from('organizations').update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data as Organization;
}

export async function deleteOrganization(id: string) {
  const { error } = await sb().from('organizations').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchOrganizationMembers(orgId: string): Promise<OrgMemberWithProfile[]> {
  const { data, error } = await sb()
    .from('organization_members')
    .select('*, profile:profiles(*)')
    .eq('organization_id', orgId)
    .order('joined_at');
  if (error) throw error;
  return (data ?? []) as OrgMemberWithProfile[];
}

export async function addOrgMember(args: { organization_id: string; user_id: string; role: OrgRole }) {
  const { data, error } = await sb().from('organization_members').insert(args).select().single();
  if (error) throw error;
  return data as OrganizationMember;
}

export async function removeOrgMember(id: string) {
  const { error } = await sb().from('organization_members').delete().eq('id', id);
  if (error) throw error;
}
