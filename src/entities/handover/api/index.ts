'use client';

import { createClient } from '@/shared/api/supabase/client';
import type { HandoverScope, TeacherHandover, TeacherRole } from '@/shared/types/database';
import type { HandoverWithProfiles } from '../model/types';

const sb = () => createClient();

// 두 FK 가 모두 profiles 를 가리켜 임베드 시 제약조건명으로 구분해야 한다.
const SELECT_WITH_PROFILES =
  '*, from_teacher:profiles!teacher_handovers_from_teacher_id_fkey(*), to_teacher:profiles!teacher_handovers_to_teacher_id_fkey(*), organization:organizations(*)';

export interface CreateHandoverInput {
  tenant_id: string;
  scope: HandoverScope;
  organization_id?: string | null;
  student_id?: string | null;
  from_teacher_id?: string | null;
  to_teacher_id: string;
  memo?: string | null;
  created_by?: string | null;
}

export async function createHandover(input: CreateHandoverInput): Promise<TeacherHandover> {
  const { data, error } = await sb().from('teacher_handovers').insert(input).select().single();
  if (error) throw error;
  return data as TeacherHandover;
}

// 반 단위 인수인계: 인계 기록을 남기고, organization_members 의 담당 선생님을 교체한다.
export async function handoverOrganizationTeacher(args: {
  tenant_id: string;
  organization_id: string;
  from_member_row_id: string;
  from_teacher_id: string;
  from_teacher_role: TeacherRole | null;
  to_teacher_id: string;
  memo?: string | null;
  created_by?: string | null;
}): Promise<void> {
  const sbc = sb();

  await createHandover({
    tenant_id: args.tenant_id,
    scope: 'organization',
    organization_id: args.organization_id,
    from_teacher_id: args.from_teacher_id,
    to_teacher_id: args.to_teacher_id,
    memo: args.memo ?? null,
    created_by: args.created_by ?? null,
  });

  // 새 선생님이 아직 반 멤버가 아니면 추가 (unique 제약 충돌 방지).
  const { data: existing } = await sbc
    .from('organization_members')
    .select('id')
    .eq('organization_id', args.organization_id)
    .eq('user_id', args.to_teacher_id)
    .eq('role', 'teacher')
    .maybeSingle();
  if (!existing) {
    // 새 선생님은 기존 선생님의 등급(담임/부담임)을 그대로 승계.
    const { error: addErr } = await sbc.from('organization_members').insert({
      organization_id: args.organization_id,
      user_id: args.to_teacher_id,
      role: 'teacher',
      teacher_role: args.from_teacher_role ?? 'homeroom',
    });
    if (addErr) throw addErr;
  }

  // 기존 선생님을 반에서 제거 (교체).
  const { error: rmErr } = await sbc
    .from('organization_members')
    .delete()
    .eq('id', args.from_member_row_id);
  if (rmErr) throw rmErr;
}

// 학생 단위 인수인계: 기록 + 메모만 남긴다. (학생의 반 소속은 그대로)
export async function handoverStudent(args: {
  tenant_id: string;
  student_id: string;
  from_teacher_id?: string | null;
  to_teacher_id: string;
  memo?: string | null;
  created_by?: string | null;
}): Promise<TeacherHandover> {
  return createHandover({
    tenant_id: args.tenant_id,
    scope: 'student',
    student_id: args.student_id,
    from_teacher_id: args.from_teacher_id ?? null,
    to_teacher_id: args.to_teacher_id,
    memo: args.memo ?? null,
    created_by: args.created_by ?? null,
  });
}

// 특정 반의 인수인계 이력.
export async function fetchHandoversForOrg(orgId: string): Promise<HandoverWithProfiles[]> {
  const { data, error } = await sb()
    .from('teacher_handovers')
    .select(SELECT_WITH_PROFILES)
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as HandoverWithProfiles[];
}

// 학생 상세에서 보여줄 인계 이력 —
// 이 학생을 직접 인수인계한 기록 + 이 학생이 속한 반의 인수인계 기록을 합친다.
export async function fetchHandoversForStudent(
  tenantId: string,
  studentId: string,
  orgIds: string[],
): Promise<HandoverWithProfiles[]> {
  const sbc = sb();

  const studentReq = sbc
    .from('teacher_handovers')
    .select(SELECT_WITH_PROFILES)
    .eq('tenant_id', tenantId)
    .eq('scope', 'student')
    .eq('student_id', studentId);

  const orgReq = orgIds.length
    ? sbc
        .from('teacher_handovers')
        .select(SELECT_WITH_PROFILES)
        .eq('scope', 'organization')
        .in('organization_id', orgIds)
    : null;

  const [studentRes, orgRes] = await Promise.all([
    studentReq,
    orgReq ?? Promise.resolve({ data: [], error: null }),
  ]);
  if (studentRes.error) throw studentRes.error;
  if (orgRes.error) throw orgRes.error;

  const all = [
    ...((studentRes.data ?? []) as HandoverWithProfiles[]),
    ...((orgRes.data ?? []) as HandoverWithProfiles[]),
  ];
  return all.sort((a, b) => b.created_at.localeCompare(a.created_at));
}
