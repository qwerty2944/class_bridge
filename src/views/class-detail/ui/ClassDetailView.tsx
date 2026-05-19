'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ArrowLeft, CalendarDays, ClipboardList, Pencil, Share2 } from 'lucide-react';
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
  type SessionWithRefs,
} from '@/entities/class-session';
import {
  fetchSessionAssignment,
  fetchSessionAssignmentMap,
  setHomeworkChecked,
  upsertSessionAssignment,
  type SessionAssignment,
} from '@/entities/assignment';
import { fetchSubjects } from '@/entities/subject';
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
  const hwQ = useQuery({
    queryKey: ['session-assignment', sessionId],
    queryFn: () => fetchSessionAssignment(sessionId),
  });

  const upd = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Parameters<typeof updateAttendance>[1] }) =>
      updateAttendance(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['attendances', sessionId] }),
  });

  // 과제 점검 — 학생의 assignment_submission 토글 + XP 지급/회수.
  const homework = useMutation({
    mutationFn: async ({
      submissionId,
      studentId,
      studentFullName,
      checked,
      xpReward,
    }: {
      submissionId: string;
      studentId: string;
      studentFullName: string | null;
      checked: boolean;
      xpReward: number;
    }) => {
      if (!tenantId) return null;
      return setHomeworkChecked({
        submissionId,
        tenantId,
        studentUserId: studentId,
        studentFullName,
        checked,
        xpReward,
      });
    },
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ['session-assignment', sessionId] });
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
  const assignment = hwQ.data;

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
        <CardContent>
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">수업 내용</p>
          <RichContent html={s.content_md} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <CardTitle className="flex items-center gap-2">
                출결 · 과제 점검
                {assignment && (
                  <Badge variant="secondary" className="gap-1">
                    <ClipboardList className="h-3.5 w-3.5" />
                    과제 1건
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {canEdit ? '출결 상태와 과제 수행을 체크하세요.' : '내 출결·과제 상태'}
              </CardDescription>
            </div>
            {assignment && (
              <Link
                href={`/assignments/${assignment.id}`}
                className="rounded-md border bg-background px-3 py-1.5 text-xs hover:bg-accent transition"
              >
                과제 상세로 →
              </Link>
            )}
          </div>
          {assignment && (
            <div className="mt-2 rounded-md border bg-muted/30 p-3 text-sm">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium">{assignment.title}</span>
                {assignment.xp_reward > 0 && (
                  <Badge variant="secondary">완료 시 +{assignment.xp_reward} XP</Badge>
                )}
                {assignment.due_at && (
                  <span className="text-xs text-muted-foreground">
                    마감: {new Date(assignment.due_at).toLocaleString('ko-KR')}
                  </span>
                )}
              </div>
              {assignment.description_md && (
                <p className="mt-1.5 whitespace-pre-wrap text-xs text-muted-foreground">
                  {assignment.description_md}
                </p>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent className="divide-y">
          {aQ.isLoading ? (
            <Skeleton className="h-24" />
          ) : aQ.data?.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">학생이 없습니다.</p>
          ) : (
            aQ.data?.map((a) => {
              const sub = assignment?.submissions.find((x) => x.student_id === a.student_id) ?? null;
              const done = sub?.status === 'graded' || sub?.status === 'submitted';
              return (
                <div key={a.id} className="flex items-center gap-3 py-3 flex-wrap">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{a.student?.full_name?.slice(0, 1) ?? '?'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{a.student?.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{a.student?.email}</p>
                  </div>
                  {canEdit ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      {assignment && sub && (
                        <label className="flex cursor-pointer items-center gap-1.5 text-xs whitespace-nowrap">
                          <Checkbox
                            checked={done}
                            onCheckedChange={(c) =>
                              homework.mutate({
                                submissionId: sub.id,
                                studentId: a.student_id,
                                studentFullName: a.student?.full_name ?? null,
                                checked: c === true,
                                xpReward: assignment.xp_reward,
                              })
                            }
                          />
                          과제 완료
                        </label>
                      )}
                      <Select
                        value={a.status}
                        onValueChange={(v) =>
                          upd.mutate({ id: a.id, patch: { status: v as AttendanceStatus } })
                        }
                      >
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
                      {assignment && (
                        <Badge variant={done ? 'default' : 'outline'}>
                          과제 {done ? '완료' : '미완료'}
                        </Badge>
                      )}
                      <Badge variant={a.status === 'present' ? 'default' : 'secondary'}>
                        {ATTENDANCE_LABEL[a.status]}
                      </Badge>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {canEdit && tenantId && (
        <PastHomeworkCheck orgId={s.organization_id} currentSessionId={sessionId} tenantId={tenantId} />
      )}
    </div>
  );
}

/** 지난 과제 점검 — 같은 반 과거 수업 중 과제가 있는 수업을 골라 학생별로 점검한다. */
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
  const others = useMemo(
    () => (sessionsQ.data ?? []).filter((x) => x.id !== currentSessionId),
    [sessionsQ.data, currentSessionId],
  );

  // 과제가 있는 수업만 PastHomeworkCheck 의 옵션으로 노출 (N+1 회피 위해 묶음 조회).
  const mapQ = useQuery({
    queryKey: ['session-assignment-map', orgId, others.map((o) => o.id).join(',')],
    enabled: others.length > 0,
    queryFn: () => fetchSessionAssignmentMap(others.map((o) => o.id)),
  });
  const eligible = useMemo(
    () => others.filter((x) => mapQ.data && mapQ.data[x.id]),
    [others, mapQ.data],
  );

  const selectedId = picked || eligible[0]?.id || '';
  const selected = eligible.find((x) => x.id === selectedId) ?? null;

  const hwQ = useQuery({
    queryKey: ['session-assignment', selectedId],
    enabled: !!selectedId,
    queryFn: () => fetchSessionAssignment(selectedId),
  });

  const homework = useMutation({
    mutationFn: async ({
      submissionId,
      studentId,
      studentFullName,
      checked,
    }: {
      submissionId: string;
      studentId: string;
      studentFullName: string | null;
      checked: boolean;
    }) =>
      setHomeworkChecked({
        submissionId,
        tenantId,
        studentUserId: studentId,
        studentFullName,
        checked,
        xpReward: hwQ.data?.xp_reward ?? 0,
      }),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ['session-assignment', selectedId] });
      qc.invalidateQueries({ queryKey: ['character'] });
      if (r && r.xpAdded !== 0) {
        toast.success(
          r.xpAdded > 0 ? `과제 점검 — +${r.xpAdded} XP` : `과제 점검 취소 — ${r.xpAdded} XP`,
        );
      }
    },
    onError: (e) => toast.error((e as Error).message),
  });

  if (!sessionsQ.isLoading && eligible.length === 0) return null;

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
                const x = eligible.find((o) => o.id === String(value ?? ''));
                return x
                  ? `${new Date(x.session_date).toLocaleDateString('ko-KR')} · ${x.topic ?? '수업'}`
                  : '수업 선택';
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {eligible.map((x) => (
              <SelectItem key={x.id} value={x.id}>
                {new Date(x.session_date).toLocaleDateString('ko-KR')} · {x.topic ?? '수업'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selected && hwQ.data && (
          <div className="rounded-md border bg-muted/30 p-3 text-sm">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium">{hwQ.data.title}</span>
              {hwQ.data.xp_reward > 0 && (
                <Badge variant="secondary">완료 시 +{hwQ.data.xp_reward} XP</Badge>
              )}
              {hwQ.data.due_at && (
                <span className="text-xs text-muted-foreground">
                  마감: {new Date(hwQ.data.due_at).toLocaleString('ko-KR')}
                </span>
              )}
            </div>
            {hwQ.data.description_md && (
              <p className="mt-1.5 whitespace-pre-wrap text-xs text-muted-foreground">
                {hwQ.data.description_md}
              </p>
            )}
          </div>
        )}

        <div className="divide-y">
          {hwQ.isLoading ? (
            <Skeleton className="h-24" />
          ) : !hwQ.data || hwQ.data.submissions.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">학생이 없습니다.</p>
          ) : (
            renderSubmissions(hwQ.data, (sub) =>
              homework.mutate({
                submissionId: sub.id,
                studentId: sub.student_id,
                studentFullName: sub.student?.full_name ?? null,
                checked: !(sub.status === 'graded' || sub.status === 'submitted'),
              }),
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function renderSubmissions(
  assignment: SessionAssignment,
  onToggle: (sub: SessionAssignment['submissions'][number]) => void,
) {
  return assignment.submissions.map((sub) => {
    const done = sub.status === 'graded' || sub.status === 'submitted';
    return (
      <div key={sub.id} className="flex items-center gap-3 py-2.5">
        <Avatar className="h-8 w-8">
          <AvatarFallback>{sub.student?.full_name?.slice(0, 1) ?? '?'}</AvatarFallback>
        </Avatar>
        <p className="min-w-0 flex-1 truncate text-sm font-medium">{sub.student?.full_name}</p>
        <label className="flex cursor-pointer items-center gap-1.5 text-xs whitespace-nowrap">
          <Checkbox checked={done} onCheckedChange={() => onToggle(sub)} />
          과제 완료
        </label>
      </div>
    );
  });
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
        {/* open 시 폼을 새로 마운트해 항상 최신 수업/과제 데이터로 초기화 */}
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
  // 기존 연결 과제 prefill — open 시 한 번만 로드.
  const hwQ = useQuery({
    queryKey: ['session-assignment', session.id],
    queryFn: () => fetchSessionAssignment(session.id),
  });

  const [form, setForm] = useState({
    session_date: session.session_date,
    start_time: session.start_time ?? '',
    end_time: session.end_time ?? '',
    topic: session.topic ?? '',
    subject_id: session.subject_id,
    content_md: session.content_md ?? '',
    add_homework: false,
    hw_title: '',
    hw_description: '',
    hw_due_at: '',
    hw_xp: '',
  });
  const [hwLoaded, setHwLoaded] = useState(false);
  // hwQ 의 결과로 폼을 한 번 채워준다 (set-state-in-effect 회피 위해 isFetched 후 lazy init).
  if (hwQ.isFetched && !hwLoaded) {
    const a = hwQ.data;
    setHwLoaded(true);
    if (a) {
      setForm((f) => ({
        ...f,
        add_homework: true,
        hw_title: a.title,
        hw_description: a.description_md ?? '',
        hw_due_at: toDateTimeLocal(a.due_at),
        hw_xp: a.xp_reward ? String(a.xp_reward) : '',
      }));
    }
  }
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!form.session_date) return;
    setBusy(true);
    try {
      await updateClassSession(session.id, {
        session_date: form.session_date,
        start_time: form.start_time || null,
        end_time: form.end_time || null,
        topic: form.topic || null,
        subject_id: form.subject_id,
        content_md: form.content_md || null,
      });
      const wantHomework = form.add_homework && form.hw_title.trim().length > 0;
      await upsertSessionAssignment({
        sessionId: session.id,
        organizationId: session.organization_id,
        subjectId: form.subject_id,
        createdBy: session.teacher_id,
        assignment: wantHomework
          ? {
              title: form.hw_title.trim(),
              descriptionMd: form.hw_description.trim() || null,
              dueAt: form.hw_due_at ? new Date(form.hw_due_at).toISOString() : null,
              xpReward: form.hw_xp ? Math.max(0, Math.round(Number(form.hw_xp))) : 0,
            }
          : null,
      });
      qc.invalidateQueries({ queryKey: ['session', session.id] });
      qc.invalidateQueries({ queryKey: ['session-assignment', session.id] });
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
        <div className="rounded-lg border bg-muted/30 p-3 space-y-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
            <Checkbox
              checked={form.add_homework}
              onCheckedChange={(c) => setForm({ ...form, add_homework: c === true })}
            />
            이 수업에 과제 추가
          </label>
          {form.add_homework && (
            <div className="space-y-3 pl-1">
              <div>
                <Label>과제 제목</Label>
                <Input
                  value={form.hw_title}
                  onChange={(e) => setForm({ ...form, hw_title: e.target.value })}
                  placeholder="예: 교재 p.120 ~ 122 문제 풀이"
                />
              </div>
              <div>
                <Label>과제 설명</Label>
                <Textarea
                  rows={2}
                  value={form.hw_description}
                  onChange={(e) => setForm({ ...form, hw_description: e.target.value })}
                  placeholder="자세한 안내 (선택)"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>마감일</Label>
                  <Input
                    type="datetime-local"
                    value={form.hw_due_at}
                    onChange={(e) => setForm({ ...form, hw_due_at: e.target.value })}
                  />
                </div>
                <div>
                  <Label>완료 시 XP</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.hw_xp}
                    onChange={(e) => setForm({ ...form, hw_xp: e.target.value })}
                    placeholder="예: 20"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                토글을 끄면 연결된 과제가 삭제됩니다.
              </p>
            </div>
          )}
        </div>
      </div>
      <DialogFooter>
        <Button disabled={busy || !hwQ.isFetched} onClick={submit}>
          저장
        </Button>
      </DialogFooter>
    </>
  );
}
