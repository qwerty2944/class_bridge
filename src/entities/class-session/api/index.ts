'use client';

import { createClient } from '@/shared/api/supabase/client';
import type { Attendance, ClassSession } from '@/shared/types/database';
import type { SessionWithRefs, AttendanceWithStudent, AttendanceWithSession } from '../model/types';

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
    await sb()
      .from('attendances')
      .insert(
        (students as { user_id: string }[]).map((s) => ({
          class_session_id: (data as { id: string }).id,
          student_id: s.user_id,
          status: 'present' as const,
        })),
      );
  }
  return data as ClassSession;
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
