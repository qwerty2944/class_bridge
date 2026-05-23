'use client';

import { createClient } from '@/shared/api/supabase/client';
import type {
  Organization,
  OrganizationMember,
  OrgRole,
  Subject,
  TeacherRole,
} from '@/shared/types/database';
import type { OrgMemberWithProfile, OrgWithSubjects } from '../model/types';

const sb = () => createClient();

// Supabase 의 nested select 결과를 OrgWithSubjects 로 매핑.
function normalizeOrg(
  row: Organization & { organization_subjects?: { subject: Subject | null }[] },
): OrgWithSubjects {
  const subjects = (row.organization_subjects ?? [])
    .map((r) => r.subject)
    .filter((s): s is Subject => !!s);
  // organization_subjects 필드는 응답에서 제거 — 외부에서 모를 필요 없음.
  const { organization_subjects: _, ...rest } = row;
  return { ...rest, subjects };
}

export async function fetchOrganizations(tenantId: string): Promise<OrgWithSubjects[]> {
  const { data, error } = await sb()
    .from('organizations')
    .select('*, organization_subjects(subject:subjects(*))')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return ((data ?? []) as Parameters<typeof normalizeOrg>[0][]).map(normalizeOrg);
}

export async function fetchOrganizationsForUser(
  tenantId: string,
  userId: string,
): Promise<OrgWithSubjects[]> {
  const { data: rows } = await sb()
    .from('organization_members')
    .select('organization:organizations(*, organization_subjects(subject:subjects(*)))')
    .eq('user_id', userId);
  const all = ((rows ?? []) as { organization: unknown }[]).map((r) =>
    normalizeOrg(r.organization as Parameters<typeof normalizeOrg>[0]),
  );
  return all.filter((o) => o && o.tenant_id === tenantId);
}

export async function fetchOrganization(id: string): Promise<OrgWithSubjects | null> {
  const { data } = await sb()
    .from('organizations')
    .select('*, organization_subjects(subject:subjects(*))')
    .eq('id', id)
    .maybeSingle();
  return data ? normalizeOrg(data as Parameters<typeof normalizeOrg>[0]) : null;
}

export async function createOrganization(input: {
  tenant_id: string;
  name: string;
  description?: string | null;
  /** 종합반 — 여러 과목 동시 지정 가능. 비우면 과목 없음. */
  subject_ids?: string[];
  color?: string | null;
  created_by?: string | null;
}) {
  const { subject_ids, ...orgFields } = input;
  const { data, error } = await sb().from('organizations').insert(orgFields).select().single();
  if (error) throw error;
  const org = data as Organization;
  if (subject_ids && subject_ids.length > 0) {
    await sb()
      .from('organization_subjects')
      .insert(subject_ids.map((sid) => ({ organization_id: org.id, subject_id: sid })));
  }
  return org;
}

export async function updateOrganization(id: string, patch: Partial<Organization>) {
  const { data, error } = await sb()
    .from('organizations')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Organization;
}

/** 반의 과목 set 을 통째로 갱신 — diff 해서 add/remove. */
export async function setOrganizationSubjects(orgId: string, subjectIds: string[]) {
  const { data: current, error: e1 } = await sb()
    .from('organization_subjects')
    .select('subject_id')
    .eq('organization_id', orgId);
  if (e1) throw e1;
  const currentIds = ((current ?? []) as { subject_id: string }[]).map((r) => r.subject_id);
  const toAdd = subjectIds.filter((id) => !currentIds.includes(id));
  const toRemove = currentIds.filter((id) => !subjectIds.includes(id));
  if (toAdd.length) {
    await sb()
      .from('organization_subjects')
      .insert(toAdd.map((sid) => ({ organization_id: orgId, subject_id: sid })));
  }
  if (toRemove.length) {
    await sb()
      .from('organization_subjects')
      .delete()
      .eq('organization_id', orgId)
      .in('subject_id', toRemove);
  }
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

export async function addOrgMember(args: {
  organization_id: string;
  user_id: string;
  role: OrgRole;
  teacher_role?: TeacherRole | null;
}) {
  const { data, error } = await sb().from('organization_members').insert(args).select().single();
  if (error) throw error;
  return data as OrganizationMember;
}

// 담임 ↔ 부담임 등급 변경.
export async function updateOrgMemberTeacherRole(id: string, teacher_role: TeacherRole) {
  const { data, error } = await sb()
    .from('organization_members')
    .update({ teacher_role })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as OrganizationMember;
}

export async function removeOrgMember(id: string) {
  const { error } = await sb().from('organization_members').delete().eq('id', id);
  if (error) throw error;
}
