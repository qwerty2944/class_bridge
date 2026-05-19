'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { ArrowLeft, Check, Clock, X, CalendarDays, Pencil, Share2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Checkbox } from '@/shared/ui/checkbox';
import { Skeleton } from '@/shared/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import {
  ensureClassShareToken,
  fetchAttendances,
  fetchClassSession,
  fetchClassSessions,
  updateAttendance,
  updateClassSession,
  type AttendanceWithStudent,
  type SessionWithRefs,
} from '@/entities/class-session';
import { syncHomeworkAssignment } from '@/entities/assignment';
import { fetchSubjects } from '@/entities/subject';
import { awardForHomework } from '@/entities/reward';
import { RichContent, RichTextEditor } from '@/features/rich-text-editor';
import { useCurrentTenant } from '@/features/tenant-switch';
import { ATTENDANCE_LABEL, type AttendanceStatus } from '@/shared/types/database';

const STATUSES: AttendanceStatus[] = ['present', 'late', 'absent', 'excused'];

// ISO 문자열 → <input type="datetime-local"> 용 로컬 시각 문자열.
function toDateTimeLocal(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export function ClassDetailClient({ sessionId }: { sessionId: string }) {
  const { has, tenantId } = useCurrentTenant();
  const qc = useQueryClient();
  const sQ = useQuery({ queryKey: ['session', sessionId], queryFn: () => fetchClassSession(sessionId) });
  const aQ = useQuery({ queryKey: ['attendances', sessionId], queryFn: () => fetchAttendances(sessionId) });

  const upd = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Parameters<typeof updateAttendance>[1] }) =>
      updateAttendance(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['attendances', sessionId] }),
  });

  // 과제 점검 — 체크 저장 + 경험치 지급/회수.
  const homework = useMutation({
    mutationFn: async ({
      attendance,
      done,
      xpReward,
    }: {
      attendance: AttendanceWithStudent;
      done: boolean;
      xpReward: number;
    }) => {
      await updateAttendance(attendance.id, { homework_done: done });
      if (!tenantId) return null;
      return awardForHomework({
        tenantId,
        studentUserId: attendance.student_id,
        studentFullName: attendance.student?.full_name ?? null,
        attendanceId: attendance.id,
        xpReward,
        done,
      });
    },
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ['attendances', sessionId] });
      qc.invalidateQueries({ queryKey: ['character'] });
      if (r && r.xpAdded !== 0) {
        toast.success(
          r.leveledUp
            ? `과제 점검! +${r.xpAdded} XP — Lv.${r.oldLevel}→Lv.${r.newLevel}`
            : r.xpAdded > 0
              ? `과제 점검 — +${r.xpAdded} XP`
              : `과제 점검 취소 — ${r.xpAdded} XP`,
        );
      }
    },
    onError: (e) => toast.error((e as Error).message),
  });

  if (sQ.isLoading || !sQ.data) return <Skeleton className="h-40" />;
  const s = sQ.data;
  const canEdit = has('director') || has('teacher');

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/classes">
          <ArrowLeft className="h-4 w-4" /> 수업 목록
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-muted-foreground" />
                <CardTitle>{s.topic ?? '제목 없음'}</CardTitle>
                {s.subject && <Badge variant="secondary">{s.subject.name}</Badge>}
              </div>
              <CardDescription className="mt-1">
                {new Date(s.session_date).toLocaleDateString('ko-KR')}{' '}
                {s.start_time && `${s.start_time.slice(0, 5)}`}
                {s.end_time && ` ~ ${s.end_time.slice(0, 5)}`}
                {s.teacher && ` · ${s.teacher.full_name} 선생님`}
              </CardDescription>
            </div>
            {canEdit && (
              <div className="flex gap-2 shrink-0">
                <ShareSessionButton session={s} />
                <EditSessionDialog session={s} />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">수업 내용</p>
            <RichContent html={s.content_md} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">과제 메모</p>
            <p className="text-sm whitespace-pre-wrap">{s.homework_md ?? '—'}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle>출결 · 과제 점검</CardTitle>
              <CardDescription>
                {canEdit ? '출결 상태와 과제 수행을 체크하세요.' : '내 출결·과제 상태'}
              </CardDescription>
            </div>
            {s.homework_xp > 0 && (
              <Badge variant="secondary" className="shrink-0">
                과제 점검 +{s.homework_xp} XP
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="divide-y">
          {aQ.isLoading ? (
            <Skeleton className="h-24" />
          ) : aQ.data?.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">학생이 없습니다.</p>
          ) : (
            aQ.data?.map((a) => (
              <div key={a.id} className="flex items-center gap-3 py-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback>{a.student?.full_name?.slice(0, 1) ?? '?'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{a.student?.full_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{a.student?.email}</p>
                </div>
                {canEdit ? (
                  <div className="flex items-center gap-2">
                    <label className="flex cursor-pointer items-center gap-1.5 text-xs whitespace-nowrap">
                      <Checkbox
                        checked={a.homework_done}
                        onCheckedChange={(c) =>
                          homework.mutate({ attendance: a, done: c === true, xpReward: s.homework_xp })
                        }
                      />
                      과제
                    </label>
                    <Select value={a.status} onValueChange={(v) => upd.mutate({ id: a.id, patch: { status: v as AttendanceStatus } })}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((st) => (
                          <SelectItem key={st} value={st}>
                            {ATTENDANCE_LABEL[st]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="사유"
                      defaultValue={a.note ?? ''}
                      onBlur={(e) => {
                        if ((e.target.value || '') !== (a.note ?? '')) {
                          upd.mutate({ id: a.id, patch: { note: e.target.value } });
                        }
                      }}
                      className="w-[160px]"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <Badge variant={a.homework_done ? 'default' : 'outline'}>
                      과제 {a.homework_done ? '완료' : '미완료'}
                    </Badge>
                    <Badge variant={a.status === 'present' ? 'default' : 'secondary'}>
                      {ATTENDANCE_LABEL[a.status]}
                    </Badge>
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {canEdit && tenantId && (
        <PastHomeworkCheck orgId={s.organization_id} currentSessionId={sessionId} tenantId={tenantId} />
      )}
    </div>
  );
}

/** 지난 과제 점검 — 이전 수업의 과제를 불러와 학생별로 체크한다. */
function PastHomeworkCheck({
  orgId,
  currentSessionId,
  tenantId,
}: {
  orgId: string;
  currentSessionId: string;
  tenantId: string;
}) {
  const qc = useQueryClient();
  const [picked, setPicked] = useState('');

  const sessionsQ = useQuery({
    queryKey: ['class-sessions', orgId],
    queryFn: () => fetchClassSessions(orgId),
  });
  const others = (sessionsQ.data ?? []).filter((x) => x.id !== currentSessionId);
  const selectedId = picked || others[0]?.id || '';
  const selected = others.find((x) => x.id === selectedId) ?? null;

  const aQ = useQuery({
    queryKey: ['attendances', selectedId],
    enabled: !!selectedId,
    queryFn: () => fetchAttendances(selectedId),
  });

  const homework = useMutation({
    mutationFn: async ({ attendance, done }: { attendance: AttendanceWithStudent; done: boolean }) => {
      await updateAttendance(attendance.id, { homework_done: done });
      return awardForHomework({
        tenantId,
        studentUserId: attendance.student_id,
        studentFullName: attendance.student?.full_name ?? null,
        attendanceId: attendance.id,
        xpReward: selected?.homework_xp ?? 0,
        done,
      });
    },
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ['attendances', selectedId] });
      qc.invalidateQueries({ queryKey: ['character'] });
      if (r && r.xpAdded !== 0) {
        toast.success(r.xpAdded > 0 ? `과제 점검 — +${r.xpAdded} XP` : `과제 점검 취소 — ${r.xpAdded} XP`);
      }
    },
    onError: (e) => toast.error((e as Error).message),
  });

  if (!sessionsQ.isLoading && others.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>지난 과제 점검</CardTitle>
        <CardDescription>이전 수업의 과제를 불러와 학생별로 점검합니다.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Select value={selectedId} onValueChange={(v) => v && setPicked(v)}>
          <SelectTrigger>
            <SelectValue>
              {(value) => {
                const x = others.find((o) => o.id === String(value ?? ''));
                return x
                  ? `${new Date(x.session_date).toLocaleDateString('ko-KR')} · ${x.topic ?? '수업'}`
                  : '수업 선택';
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {others.map((x) => (
              <SelectItem key={x.id} value={x.id}>
                {new Date(x.session_date).toLocaleDateString('ko-KR')} · {x.topic ?? '수업'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selected && (
          <p className="text-xs text-muted-foreground">
            과제: {selected.homework_md ?? '—'}
            {selected.homework_xp > 0 && ` · 점검 시 +${selected.homework_xp} XP`}
          </p>
        )}

        <div className="divide-y">
          {aQ.isLoading ? (
            <Skeleton className="h-24" />
          ) : (aQ.data ?? []).length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">학생이 없습니다.</p>
          ) : (
            aQ.data?.map((a) => (
              <div key={a.id} className="flex items-center gap-3 py-2.5">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{a.student?.full_name?.slice(0, 1) ?? '?'}</AvatarFallback>
                </Avatar>
                <p className="min-w-0 flex-1 truncate text-sm font-medium">{a.student?.full_name}</p>
                <label className="flex cursor-pointer items-center gap-1.5 text-xs whitespace-nowrap">
                  <Checkbox
                    checked={a.homework_done}
                    onCheckedChange={(c) => homework.mutate({ attendance: a, done: c === true })}
                  />
                  과제 완료
                </label>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ShareSessionButton({ session }: { session: SessionWithRefs }) {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);

  const share = async () => {
    setBusy(true);
    try {
      const token = await ensureClassShareToken(session);
      const url = `${window.location.origin}/share/class/${token}`;
      await navigator.clipboard.writeText(url);
      qc.invalidateQueries({ queryKey: ['session', session.id] });
      toast.success('공유 링크가 복사되었습니다. 학부모에게 보내세요.');
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button variant="outline" size="sm" className="gap-1 shrink-0" onClick={share} disabled={busy}>
      <Share2 className="h-3.5 w-3.5" /> 공유
    </Button>
  );
}

function EditSessionDialog({ session }: { session: SessionWithRefs }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1 shrink-0">
          <Pencil className="h-3.5 w-3.5" /> 수정
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        {/* open 시 폼을 새로 마운트해 항상 최신 수업 데이터로 초기화 */}
        {open && <EditSessionForm session={session} onDone={() => setOpen(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function EditSessionForm({ session, onDone }: { session: SessionWithRefs; onDone: () => void }) {
  const { tenantId } = useCurrentTenant();
  const qc = useQueryClient();
  const subjectsQ = useQuery({
    queryKey: ['subjects', tenantId],
    enabled: !!tenantId,
    queryFn: () => fetchSubjects(tenantId!),
  });
  const [form, setForm] = useState({
    session_date: session.session_date,
    start_time: session.start_time ?? '',
    end_time: session.end_time ?? '',
    topic: session.topic ?? '',
    subject_id: session.subject_id,
    content_md: session.content_md ?? '',
    homework_md: session.homework_md ?? '',
    homework_xp: session.homework_xp ? String(session.homework_xp) : '',
    homework_due_at: toDateTimeLocal(session.homework_due_at),
  });
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!form.session_date) return;
    setBusy(true);
    try {
      const hwXp = form.homework_xp ? Math.max(0, Math.round(Number(form.homework_xp))) : 0;
      const hwDue = form.homework_due_at ? new Date(form.homework_due_at).toISOString() : null;
      await updateClassSession(session.id, {
        session_date: form.session_date,
        start_time: form.start_time || null,
        end_time: form.end_time || null,
        topic: form.topic || null,
        subject_id: form.subject_id,
        content_md: form.content_md || null,
        homework_md: form.homework_md || null,
        homework_xp: hwXp,
        homework_due_at: hwDue,
      });
      await syncHomeworkAssignment({
        sessionId: session.id,
        organizationId: session.organization_id,
        homeworkMd: form.homework_md || null,
        homeworkDueAt: hwDue,
        homeworkXp: hwXp,
        subjectId: form.subject_id,
        createdBy: session.teacher_id,
      });
      qc.invalidateQueries({ queryKey: ['session', session.id] });
      qc.invalidateQueries({ queryKey: ['class-sessions', session.organization_id] });
      toast.success('수업 수정됨');
      onDone();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>수업 수정</DialogTitle>
      </DialogHeader>
      <div className="space-y-3">
        <div>
          <Label>날짜</Label>
          <Input
            type="date"
            value={form.session_date}
            onChange={(e) => setForm({ ...form, session_date: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>시작</Label>
            <Input
              type="time"
              value={form.start_time}
              onChange={(e) => setForm({ ...form, start_time: e.target.value })}
            />
          </div>
          <div>
            <Label>종료</Label>
            <Input
              type="time"
              value={form.end_time}
              onChange={(e) => setForm({ ...form, end_time: e.target.value })}
            />
          </div>
        </div>
        <div>
          <Label>주제</Label>
          <Input
            value={form.topic}
            onChange={(e) => setForm({ ...form, topic: e.target.value })}
            placeholder="예: 미분의 활용"
          />
        </div>
        <div>
          <Label>과목</Label>
          <Select
            value={form.subject_id ?? '__none'}
            onValueChange={(v) => setForm({ ...form, subject_id: v === '__none' ? null : v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="선택">
                {(value) => {
                  const v = String(value ?? '');
                  if (!v || v === '__none') return '미지정';
                  return subjectsQ.data?.find((s) => s.id === v)?.name ?? '미지정';
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none">미지정</SelectItem>
              {subjectsQ.data?.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>수업 내용</Label>
          <RichTextEditor
            value={form.content_md}
            onChange={(html) => setForm({ ...form, content_md: html })}
            placeholder="오늘 다룬 내용"
          />
        </div>
        <div>
          <Label>과제(메모)</Label>
          <Textarea
            rows={2}
            value={form.homework_md}
            onChange={(e) => setForm({ ...form, homework_md: e.target.value })}
            placeholder="다음 시간까지 할 일"
          />
        </div>
        <div>
          <Label>과제 마감일</Label>
          <Input
            type="datetime-local"
            value={form.homework_due_at}
            onChange={(e) => setForm({ ...form, homework_due_at: e.target.value })}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            과제 메모를 적으면 과제 목록에 자동으로 등록됩니다.
          </p>
        </div>
        <div>
          <Label>과제 점검 XP</Label>
          <Input
            type="number"
            min={0}
            value={form.homework_xp}
            onChange={(e) => setForm({ ...form, homework_xp: e.target.value })}
            placeholder="예: 20"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            출결 화면에서 학생 과제를 체크하면 이 경험치가 지급됩니다.
          </p>
        </div>
      </div>
      <DialogFooter>
        <Button disabled={busy} onClick={submit}>
          저장
        </Button>
      </DialogFooter>
    </>
  );
}
