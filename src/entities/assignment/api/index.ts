'use client';

import { createClient } from '@/shared/api/supabase/client';
import type { Assignment, AssignmentSubmission } from '@/shared/types/database';
import type { AssignmentWithRefs, AssignmentWithSubject, SubmissionWithStudent } from '../model/types';

const sb = () => createClient();

export async function fetchAssignments(orgId: string): Promise<AssignmentWithSubject[]> {
  const { data, error } = await sb()
    .from('assignments')
    .select('*, subject:subjects(*)')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as AssignmentWithSubject[];
}

// 여러 반의 과제를 한 번에 조회 (과제 화면 카드+필터용).
export async function fetchAssignmentsByOrgs(orgIds: string[]): Promise<AssignmentWithRefs[]> {
  if (!orgIds.length) return [];
  const { data, error } = await sb()
    .from('assignments')
    .select('*, subject:subjects(*), organization:organizations(*)')
    .in('organization_id', orgIds)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as AssignmentWithRefs[];
}

export async function fetchAssignment(id: string): Promise<AssignmentWithSubject | null> {
  const { data } = await sb()
    .from('assignments')
    .select('*, subject:subjects(*)')
    .eq('id', id)
    .maybeSingle();
  return (data as AssignmentWithSubject) ?? null;
}

export async function createAssignment(input: Partial<Assignment> & { organization_id: string; title: string }) {
  const { data, error } = await sb().from('assignments').insert(input).select().single();
  if (error) throw error;

  const { data: students } = await sb()
    .from('organization_members')
    .select('user_id')
    .eq('organization_id', input.organization_id)
    .eq('role', 'student');
  if (students?.length) {
    await sb()
      .from('assignment_submissions')
      .insert(
        (students as { user_id: string }[]).map((s) => ({
          assignment_id: (data as { id: string }).id,
          student_id: s.user_id,
          status: 'pending' as const,
        })),
      );
  }
  return data as Assignment;
}

// 수업 과제 메모를 과제 목록과 동기화 — source_session_id 로 연결된 과제를 생성/갱신/삭제.
export async function syncHomeworkAssignment(input: {
  sessionId: string;
  organizationId: string;
  homeworkMd: string | null;
  homeworkDueAt: string | null;
  homeworkXp: number;
  subjectId: string | null;
  createdBy: string | null;
}): Promise<void> {
  const client = sb();
  const memo = (input.homeworkMd ?? '').trim();

  const { data: existing } = await client
    .from('assignments')
    .select('id')
    .eq('source_session_id', input.sessionId)
    .maybeSingle();
  const existingId = (existing as { id: string } | null)?.id;

  // 과제 메모가 비면 연결된 과제 제거.
  if (!memo) {
    if (existingId) await client.from('assignments').delete().eq('id', existingId);
    return;
  }

  const title = memo.split('\n')[0].slice(0, 80);

  if (existingId) {
    const { error } = await client
      .from('assignments')
      .update({
        title,
        description_md: memo,
        due_at: input.homeworkDueAt,
        xp_reward: input.homeworkXp,
        subject_id: input.subjectId,
      })
      .eq('id', existingId);
    if (error) throw error;
    return;
  }

  await createAssignment({
    organization_id: input.organizationId,
    title,
    description_md: memo,
    due_at: input.homeworkDueAt,
    xp_reward: input.homeworkXp,
    subject_id: input.subjectId,
    source_session_id: input.sessionId,
    created_by: input.createdBy,
  });
}

export async function updateAssignment(id: string, patch: Partial<Assignment>) {
  const { data, error } = await sb().from('assignments').update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data as Assignment;
}

export async function deleteAssignment(id: string) {
  const { error } = await sb().from('assignments').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchSubmissions(assignmentId: string): Promise<SubmissionWithStudent[]> {
  const { data, error } = await sb()
    .from('assignment_submissions')
    .select('*, student:profiles(*)')
    .eq('assignment_id', assignmentId);
  if (error) throw error;
  return (data ?? []) as SubmissionWithStudent[];
}

export async function fetchMySubmission(assignmentId: string, studentId: string) {
  const { data } = await sb()
    .from('assignment_submissions')
    .select('*')
    .eq('assignment_id', assignmentId)
    .eq('student_id', studentId)
    .maybeSingle();
  return (data as AssignmentSubmission) ?? null;
}

export async function submitAssignment(args: {
  assignment_id: string;
  student_id: string;
  content_md?: string;
  file_url?: string;
}) {
  const { data, error } = await sb()
    .from('assignment_submissions')
    .upsert(
      { ...args, status: 'submitted' as const, submitted_at: new Date().toISOString() },
      { onConflict: 'assignment_id,student_id' },
    )
    .select()
    .single();
  if (error) throw error;
  return data as AssignmentSubmission;
}

export async function gradeSubmission(id: string, score: number | null, feedback_md: string | null) {
  const { data, error } = await sb()
    .from('assignment_submissions')
    .update({ score, feedback_md, status: 'graded' as const })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as AssignmentSubmission;
}

export async function fetchStudentAssignments(studentId: string, orgIds: string[]) {
  if (!orgIds.length) return [];
  const { data, error } = await sb()
    .from('assignments')
    .select('*, subject:subjects(*), submissions:assignment_submissions(*)')
    .in('organization_id', orgIds);
  if (error) throw error;
  return (data ?? []).map((a: unknown) => ({
    ...(a as AssignmentWithSubject),
    mySubmission:
      (((a as { submissions?: AssignmentSubmission[] }).submissions ?? []).find(
        (s: AssignmentSubmission) => s.student_id === studentId,
      ) as AssignmentSubmission | undefined) ?? null,
  }));
}
