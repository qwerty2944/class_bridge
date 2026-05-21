'use client';

import { createClient } from '@/shared/api/supabase/client';
import { awardForGrade } from '@/entities/reward';
import type { Assignment, AssignmentSubmission } from '@/shared/types/database';
import type {
  AssignmentWithRefs,
  AssignmentWithSubject,
  SessionAssignment,
  SubmissionWithStudent,
} from '../model/types';

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

// 수업에 연결된 과제 + 학생 제출을 한 번에 가져온다.
// 출결 카드 / 지난 과제 점검 카드 모두 이 결과를 공유.
export async function fetchSessionAssignment(sessionId: string): Promise<SessionAssignment | null> {
  const { data } = await sb()
    .from('assignments')
    .select('*, subject:subjects(*), submissions:assignment_submissions(*, student:profiles(*))')
    .eq('source_session_id', sessionId)
    .maybeSingle();
  return (data as SessionAssignment) ?? null;
}

// 여러 수업에 연결된 과제 묶음 조회 (PastHomeworkCheck Select 옵션 필터링용).
// session_id → assignment id 매핑.
export async function fetchSessionAssignmentMap(
  sessionIds: string[],
): Promise<Record<string, string>> {
  if (!sessionIds.length) return {};
  const { data, error } = await sb()
    .from('assignments')
    .select('id, source_session_id')
    .in('source_session_id', sessionIds);
  if (error) throw error;
  const map: Record<string, string> = {};
  for (const row of (data ?? []) as { id: string; source_session_id: string }[]) {
    map[row.source_session_id] = row.id;
  }
  return map;
}

// 수업 폼의 과제 섹션 저장 — source_session_id 로 연결된 과제를 생성/갱신/삭제.
// assignment === null 이면 토글 OFF 로 해석해 연결 과제를 제거.
export async function upsertSessionAssignment(input: {
  sessionId: string;
  organizationId: string;
  subjectId: string | null;
  createdBy: string | null;
  assignment:
    | {
        title: string;
        descriptionMd: string | null;
        dueAt: string | null;
        xpReward: number;
      }
    | null;
}): Promise<void> {
  const client = sb();
  const { data: existing } = await client
    .from('assignments')
    .select('id')
    .eq('source_session_id', input.sessionId)
    .maybeSingle();
  const existingId = (existing as { id: string } | null)?.id;

  if (!input.assignment) {
    if (existingId) await client.from('assignments').delete().eq('id', existingId);
    return;
  }

  const a = input.assignment;
  if (existingId) {
    const { error } = await client
      .from('assignments')
      .update({
        title: a.title,
        description_md: a.descriptionMd,
        due_at: a.dueAt,
        xp_reward: a.xpReward,
        subject_id: input.subjectId,
      })
      .eq('id', existingId);
    if (error) throw error;
    return;
  }

  await createAssignment({
    organization_id: input.organizationId,
    title: a.title,
    description_md: a.descriptionMd,
    due_at: a.dueAt,
    xp_reward: a.xpReward,
    subject_id: input.subjectId,
    source_session_id: input.sessionId,
    created_by: input.createdBy,
  });
}

// 과제 점검 3단계 (안 햇음 / 햇음 / 아주 잘 햇음) — submission 의 quality + status 를 갱신하고
// awardForGrade 로 XP delta 처리. awardForGrade 가 source_ref=submissionId 로 idempotent 라
// 단계 사이를 자유롭게 오가도 reward_events 가 단일 row 만 갱신된다.
//
// - 'none': status='pending', xpReward=0 (회수)
// - 'done': status='graded', xpReward=xpReward
// - 'excellent': status='graded', xpReward=round(xpReward * 1.5)  ← 보너스
export async function setHomeworkQuality(args: {
  submissionId: string;
  tenantId: string;
  studentUserId: string;
  studentFullName?: string | null;
  quality: 'none' | 'done' | 'excellent';
  xpReward: number;
}) {
  const client = sb();

  if (args.quality === 'none') {
    const { error } = await client
      .from('assignment_submissions')
      .update({
        quality: 'none' as const,
        status: 'pending' as const,
        submitted_at: null,
        score: null,
        feedback_md: null,
      })
      .eq('id', args.submissionId);
    if (error) throw error;
  } else {
    const { error } = await client
      .from('assignment_submissions')
      .update({
        quality: args.quality,
        status: 'graded' as const,
        submitted_at: new Date().toISOString(),
      })
      .eq('id', args.submissionId);
    if (error) throw error;
  }

  const xp =
    args.quality === 'excellent'
      ? Math.round(args.xpReward * 1.5)
      : args.quality === 'done'
        ? args.xpReward
        : 0;

  return awardForGrade({
    tenantId: args.tenantId,
    studentUserId: args.studentUserId,
    studentFullName: args.studentFullName,
    submissionId: args.submissionId,
    score: 0,
    xpReward: xp,
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
