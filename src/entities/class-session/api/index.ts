'use client';

import { createClient } from '@/shared/api/supabase/client';
import type { Attendance, ClassSession } from '@/shared/types/database';
import type {
  SessionWithRefs,
  SessionWithOrg,
  AttendanceWithStudent,
  AttendanceWithSession,
} from '../model/types';

const sb = () => createClient();

export async function fetchClassSessions(orgId: string): Promise<SessionWithRefs[]> {
  const { data, error } = await sb()
    .from('class_sessions')
    .select('*, subject:subjects(*), teacher:profiles!class_sessions_teacher_id_fkey(*)')
    .eq('organization_id', orgId)
    .order('session_date', { ascending: false })
    .order('start_time', { ascending: false });
  if (error) throw error;
  return (data ?? []) as SessionWithRefs[];
}

// 여러 반의 수업을 한 번에 조회 (수업 페이지의 카드 + 필터용).
export async function fetchClassSessionsByOrgs(orgIds: string[]): Promise<SessionWithOrg[]> {
  if (!orgIds.length) return [];
  const { data, error } = await sb()
    .from('class_sessions')
    .select(
      '*, subject:subjects(*), teacher:profiles!class_sessions_teacher_id_fkey(*), organization:organizations(*), attendances(id, student_id, session_no, student:profiles(id, full_name))',
    )
    .in('organization_id', orgIds)
    .order('session_date', { ascending: false })
    .order('start_time', { ascending: false });
  if (error) throw error;
  return (data ?? []) as SessionWithOrg[];
}

export async function fetchClassSession(id: string): Promise<SessionWithRefs | null> {
  const { data } = await sb()
    .from('class_sessions')
    .select('*, subject:subjects(*), teacher:profiles!class_sessions_teacher_id_fkey(*)')
    .eq('id', id)
    .maybeSingle();
  return (data as SessionWithRefs) ?? null;
}

export async function createClassSession(input: Partial<ClassSession> & {
  organization_id: string;
  session_date: string;
}): Promise<ClassSession> {
  const { data, error } = await sb().from('class_sessions').insert(input).select().single();
  if (error) throw error;

  const { data: students } = await sb()
    .from('organization_members')
    .select('user_id')
    .eq('organization_id', input.organization_id)
    .eq('role', 'student');

  if (students?.length) {
    const created = data as ClassSession;
    const nextNo = await getNextSessionNos(
      created.organization_id,
      (students as { user_id: string }[]).map((s) => s.user_id),
      created,
    );
    await sb()
      .from('attendances')
      .insert(
        (students as { user_id: string }[]).map((s) => ({
          class_session_id: created.id,
          student_id: s.user_id,
          status: 'present' as const,
          session_no: nextNo.get(s.user_id) ?? 1,
        })),
      );
  }
  return data as ClassSession;
}

// 수업 정렬 키 — 날짜 → 시작 시각 → 생성 시각.
function sessionKey(s: Pick<ClassSession, 'session_date' | 'start_time' | 'created_at'>) {
  return `${s.session_date} ${s.start_time ?? '99:99'} ${s.created_at}`;
}

// 학생별 다음 회차 — 이 수업보다 앞선 마지막 회차 + 1, 주기(session_cycle)를 넘기면 1 로 리셋.
async function getNextSessionNos(
  orgId: string,
  studentIds: string[],
  session: ClassSession,
): Promise<Map<string, number>> {
  const [{ data: members }, { data: rows }] = await Promise.all([
    sb()
      .from('organization_members')
      .select('user_id, session_cycle')
      .eq('organization_id', orgId)
      .in('user_id', studentIds),
    sb()
      .from('attendances')
      .select('student_id, session_no, session:class_sessions!inner(organization_id, session_date, start_time, created_at)')
      .eq('session.organization_id', orgId)
      .in('student_id', studentIds)
      .neq('class_session_id', session.id)
      .not('session_no', 'is', null),
  ]);
  const cycleOf = new Map(
    ((members ?? []) as { user_id: string; session_cycle: number | null }[]).map((m) => [
      m.user_id,
      m.session_cycle ?? 8,
    ]),
  );
  const target = sessionKey(session);
  // 학생별로 이 수업 직전의 회차를 찾는다.
  const last = new Map<string, { key: string; no: number }>();
  for (const r of (rows ?? []) as unknown as {
    student_id: string;
    session_no: number;
    session: Pick<ClassSession, 'session_date' | 'start_time' | 'created_at'>;
  }[]) {
    const key = sessionKey(r.session);
    if (key >= target) continue;
    const prev = last.get(r.student_id);
    if (!prev || key > prev.key) last.set(r.student_id, { key, no: r.session_no });
  }
  const out = new Map<string, number>();
  for (const id of studentIds) {
    const cycle = cycleOf.get(id) ?? 8;
    const prev = last.get(id)?.no;
    out.set(id, prev ? (prev % cycle) + 1 : 1);
  }
  return out;
}

export async function updateClassSession(id: string, patch: Partial<ClassSession>) {
  const { data, error } = await sb().from('class_sessions').update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data as ClassSession;
}

export async function deleteClassSession(id: string) {
  const { error } = await sb().from('class_sessions').delete().eq('id', id);
  if (error) throw error;
}

// 수업 공유 토큰 보장 — 없으면 생성해 저장하고, 토큰을 반환한다.
export async function ensureClassShareToken(session: ClassSession): Promise<string> {
  if (session.share_token) return session.share_token;
  const token = crypto.randomUUID();
  const { error } = await sb()
    .from('class_sessions')
    .update({ share_token: token })
    .eq('id', session.id);
  if (error) throw error;
  return token;
}

export async function fetchAttendances(sessionId: string): Promise<AttendanceWithStudent[]> {
  const { data, error } = await sb()
    .from('attendances')
    .select('*, student:profiles(*)')
    .eq('class_session_id', sessionId);
  if (error) throw error;
  return (data ?? []) as AttendanceWithStudent[];
}

export async function updateAttendance(id: string, patch: Partial<Attendance>) {
  const { data, error } = await sb().from('attendances').update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data as Attendance;
}

export async function fetchAttendancesByStudent(
  studentId: string,
  orgIds: string[],
): Promise<AttendanceWithSession[]> {
  if (!orgIds.length) return [];
  const { data, error } = await sb()
    .from('attendances')
    .select('*, session:class_sessions!inner(*, subject:subjects(*))')
    .eq('student_id', studentId)
    .in('session.organization_id', orgIds);
  if (error) throw error;
  const rows = (data ?? []) as AttendanceWithSession[];
  return rows.sort((a, b) => {
    const da = a.session?.session_date ?? '';
    const db = b.session?.session_date ?? '';
    return db.localeCompare(da);
  });
}
