'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { ArrowLeft, CalendarDays, ClipboardList, Pencil, Plus, Share2, X } from 'lucide-react';
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
  addSessionReview,
  createAssignment,
  deleteAssignment,
  fetchSessionAssignments,
  fetchSessionReviewIds,
  removeSessionReview,
  setSubmissionApproved,
  setSubmissionQuality,
  upsertSessionAssignment,
  type SessionAssignment,
} from '@/entities/assignment';
import { HomeworkReviewPicker } from '@/features/homework-review';
import { fetchSubjects } from '@/entities/subject';
import { RichContent, RichTextEditor } from '@/features/rich-text-editor';
import { useCurrentTenant } from '@/features/tenant-switch';
import {
  ATTENDANCE_LABEL,
  SUBMISSION_QUALITY_LABEL,
  type AttendanceStatus,
  type SubmissionQuality,
} from '@/shared/types/database';
import { QualitySegmented } from '@/views/assignment-detail/ui/AssignmentDetailView';

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
  // 이 수업에서 만든 과제 (여러 개 가능 — source_session_id = sessionId).
  const sessionAssignmentsQ = useQuery({
    queryKey: ['session-assignments', sessionId],
    queryFn: () => fetchSessionAssignments(sessionId),
  });
  // 이 수업에서 점검 중인 지난 과제 id 들 (junction).
  const reviewIdsQ = useQuery({
    queryKey: ['session-review-ids', sessionId],
    queryFn: () => fetchSessionReviewIds(sessionId),
  });

  const upd = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Parameters<typeof updateAttendance>[1] }) =>
      updateAttendance(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['attendances', sessionId] }),
  });

  // 4-state 등급만 갱신 — 확정 여부와 무관. 이미 확정된 행이면 XP delta 자동 적용.
  const quality = useMutation({
    mutationFn: async ({
      submissionId,
      studentId,
      studentFullName,
      quality,
      xpReward,
    }: {
      submissionId: string;
      studentId: string;
      studentFullName: string | null;
      quality: SubmissionQuality;
      xpReward: number;
    }) => {
      if (!tenantId) return null;
      return setSubmissionQuality({
        submissionId,
        tenantId,
        studentUserId: studentId,
        studentFullName,
        quality,
        xpReward,
      });
    },
    onSuccess: (r, vars) => {
      qc.invalidateQueries({ queryKey: ['session-assignments', sessionId] });
      qc.invalidateQueries({ queryKey: ['character'] });
      const label = SUBMISSION_QUALITY_LABEL[vars.quality];
      if (r && r.xpAdded !== 0) {
        toast.success(`${label} — ${r.xpAdded > 0 ? '+' : ''}${r.xpAdded} XP`);
      } else {
        toast.success(label);
      }
    },
    onError: (e) => toast.error((e as Error).message),
  });

  // 승인 토글 — 현재 quality 기준 XP 지급/회수, status pending↔graded.
  const approve = useMutation({
    mutationFn: async ({
      submissionId,
      studentId,
      studentFullName,
      approved,
      quality,
      xpReward,
    }: {
      submissionId: string;
      studentId: string;
      studentFullName: string | null;
      approved: boolean;
      quality: SubmissionQuality;
      xpReward: number;
    }) => {
      if (!tenantId) return null;
      return setSubmissionApproved({
        submissionId,
        tenantId,
        studentUserId: studentId,
        studentFullName,
        approved,
        quality,
        xpReward,
      });
    },
    onSuccess: (r, vars) => {
      qc.invalidateQueries({ queryKey: ['session-assignments', sessionId] });
      qc.invalidateQueries({ queryKey: ['character'] });
      if (r && r.xpAdded !== 0) {
        toast.success(
          vars.approved ? `확정 — +${r.xpAdded} XP` : `확정 해제 — ${r.xpAdded} XP`,
        );
      } else {
        toast.success(vars.approved ? '확정됨' : '확정 해제됨');
      }
    },
    onError: (e) => toast.error((e as Error).message),
  });

  if (sQ.isLoading || !sQ.data) return <Skeleton className="h-40" />;
  const s = sQ.data;
  const canEdit = has('director') || has('teacher');
  const sessionAssignments = sessionAssignmentsQ.data ?? [];
  const reviewIds = reviewIdsQ.data ?? [];

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

      {/* 출결 카드 — 출석 상태 + 사유만. 과제 점검은 아래 별도 카드. */}
      <Card>
        <CardHeader>
          <CardTitle>출결</CardTitle>
          <CardDescription>
            {canEdit ? '학생별 출결 상태를 체크하세요.' : '내 출결 상태'}
          </CardDescription>
        </CardHeader>
        <CardContent className="divide-y">
          {aQ.isLoading ? (
            <Skeleton className="h-24" />
          ) : aQ.data?.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">학생이 없습니다.</p>
          ) : (
            aQ.data?.map((a) => (
              <div key={a.id} className="flex items-center gap-3 py-3 flex-wrap">
                <Avatar className="h-9 w-9">
                  <AvatarFallback>{a.student?.full_name?.slice(0, 1) ?? '?'}</AvatarFallback>
                </Avatar>
                <Link
                  href={`/students/${a.student_id}`}
                  className="flex-1 min-w-0 hover:underline"
                >
                  <p className="text-sm font-medium truncate">{a.student?.full_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{a.student?.email}</p>
                </Link>
                {canEdit ? (
                  <div className="flex items-center gap-2 flex-wrap flex-1 justify-end min-w-0">
                    <Select
                      value={a.status}
                      onValueChange={(v) =>
                        upd.mutate({ id: a.id, patch: { status: v as AttendanceStatus } })
                      }
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue>
                          {(value) =>
                            ATTENDANCE_LABEL[String(value ?? 'present') as AttendanceStatus] ?? '출석'
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((st) => (
                          <SelectItem key={st} value={st}>
                            {ATTENDANCE_LABEL[st]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {/* 출석이면 사유는 의미 없음 — 결석/지각/사유결석 일 때만 노출. */}
                    {a.status !== 'present' && (
                      <Input
                        placeholder="사유"
                        defaultValue={a.note ?? ''}
                        onBlur={(e) => {
                          if ((e.target.value || '') !== (a.note ?? '')) {
                            upd.mutate({ id: a.id, patch: { note: e.target.value } });
                          }
                        }}
                        className="flex-1 min-w-[200px] max-w-[400px]"
                      />
                    )}
                  </div>
                ) : (
                  <Badge variant={a.status === 'present' ? 'default' : 'secondary'}>
                    {ATTENDANCE_LABEL[a.status]}
                  </Badge>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* 과제 카드 — 이번 수업 과제와 지난 과제 점검. '점검' 표현은 과거 과제 섹션에만 사용. */}
      {canEdit && tenantId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-muted-foreground" /> 과제
            </CardTitle>
            <CardDescription>
              이번 수업에서 나가는 과제와, 지난 수업의 과제 점검을 관리합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ThisSessionAssignments
              sessionId={sessionId}
              orgId={s.organization_id}
              subjectId={s.subject_id}
              teacherId={s.teacher_id}
              tenantId={tenantId}
              assignments={sessionAssignments}
              onQuality={(args) => quality.mutate(args)}
              onApprove={(args) => approve.mutate(args)}
            />
            <PastReviews
              sessionId={sessionId}
              orgId={s.organization_id}
              tenantId={tenantId}
              reviewIds={reviewIds}
            />
          </CardContent>
        </Card>
      )}

      {/*
        지난 과제 점검 (PastHomeworkCheck) 은 이제 위 카드의 'PastReviews' 가 대체.
        남겨두던 카드는 일단 주석 처리.
        {canEdit && tenantId && (
          <PastHomeworkCheck
            orgId={s.organization_id}
            currentSessionId={sessionId}
            tenantId={tenantId}
            defaultAssignmentId={null}
          />
        )}
      */}
    </div>
  );
}

/** 이번 수업에서 만든 과제들 — 여러 개 가능. 각 과제 카드 내 학생별 quality/승인 UI. */
function ThisSessionAssignments({
  sessionId,
  orgId,
  subjectId,
  teacherId,
  tenantId,
  assignments,
  onQuality,
  onApprove,
}: {
  sessionId: string;
  orgId: string;
  subjectId: string | null;
  teacherId: string | null;
  tenantId: string;
  assignments: SessionAssignment[];
  onQuality: (args: {
    submissionId: string;
    studentId: string;
    studentFullName: string | null;
    quality: SubmissionQuality;
    xpReward: number;
  }) => void;
  onApprove: (args: {
    submissionId: string;
    studentId: string;
    studentFullName: string | null;
    approved: boolean;
    quality: SubmissionQuality;
    xpReward: number;
  }) => void;
}) {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const create = useMutation({
    mutationFn: (input: {
      title: string;
      descriptionMd: string | null;
      dueAt: string | null;
      xpReward: number;
    }) =>
      createAssignment({
        organization_id: orgId,
        title: input.title,
        description_md: input.descriptionMd,
        due_at: input.dueAt,
        xp_reward: input.xpReward,
        subject_id: subjectId,
        source_session_id: sessionId,
        created_by: teacherId,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['session-assignments', sessionId] });
      toast.success('과제 추가됨');
      setShowForm(false);
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteAssignment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['session-assignments', sessionId] });
      toast.success('과제 삭제됨');
    },
    onError: (e) => toast.error((e as Error).message),
  });

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">이번 수업에서 나가는 과제</h3>
        <Button size="sm" variant="outline" onClick={() => setShowForm((v) => !v)}>
          <Plus className="h-3.5 w-3.5" /> 과제 추가
        </Button>
      </div>

      {assignments.length === 0 && !showForm && (
        <p className="text-xs text-muted-foreground py-2">아직 과제가 없습니다.</p>
      )}

      {assignments.map((a) => (
        <div key={a.id} className="rounded-lg border bg-card">
          <div className="flex items-start gap-2 p-3 border-b bg-muted/30">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href={`/assignments/${a.id}`}
                  className="font-medium text-sm hover:underline"
                >
                  {a.title}
                </Link>
                {a.xp_reward > 0 && (
                  <Badge variant="secondary">완료 +{a.xp_reward} XP</Badge>
                )}
                {a.due_at && (
                  <span className="text-xs text-muted-foreground">
                    마감 {new Date(a.due_at).toLocaleString('ko-KR')}
                  </span>
                )}
              </div>
              {a.description_md && (
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  {a.description_md}
                </p>
              )}
            </div>
            <Link
              href={`/assignments/${a.id}`}
              className="shrink-0 rounded-md border bg-background px-2 py-1 text-xs hover:bg-accent transition"
            >
              과제 상세 →
            </Link>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => {
                if (confirm('이 과제를 삭제할까요? 학생 제출 기록도 함께 사라집니다.'))
                  del.mutate(a.id);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="divide-y px-3">
            {a.submissions.length === 0 ? (
              <p className="py-3 text-xs text-muted-foreground text-center">학생 없음</p>
            ) : (
              a.submissions.map((sub) => {
                const studentSubmitted = sub.status === 'submitted';
                return (
                  <div key={sub.id} className="flex items-center gap-3 py-2.5 flex-wrap">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{sub.student?.full_name?.slice(0, 1) ?? '?'}</AvatarFallback>
                    </Avatar>
                    <Link
                      href={`/students/${sub.student_id}`}
                      className="min-w-0 flex-1 truncate text-sm font-medium hover:underline"
                    >
                      {sub.student?.full_name}
                    </Link>
                    {studentSubmitted && (
                      <Badge variant="outline" className="border-amber-400 text-amber-700">
                        학생 제출
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      variant={sub.status === 'graded' ? 'default' : 'outline'}
                      onClick={() =>
                        onApprove({
                          submissionId: sub.id,
                          studentId: sub.student_id,
                          studentFullName: sub.student?.full_name ?? null,
                          approved: sub.status !== 'graded',
                          quality: sub.quality,
                          xpReward: a.xp_reward,
                        })
                      }
                    >
                      {sub.status === 'graded' ? '확정됨' : '승인'}
                    </Button>
                    <QualitySegmented
                      value={sub.quality}
                      onChange={(q) =>
                        onQuality({
                          submissionId: sub.id,
                          studentId: sub.student_id,
                          studentFullName: sub.student?.full_name ?? null,
                          quality: q,
                          xpReward: a.xp_reward,
                        })
                      }
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>
      ))}

      {showForm && (
        <NewAssignmentInline
          onSave={(payload) => create.mutate(payload)}
          onCancel={() => setShowForm(false)}
          busy={create.isPending}
        />
      )}

      <input type="hidden" data-tenant-id={tenantId} />
    </section>
  );
}

function NewAssignmentInline({
  onSave,
  onCancel,
  busy,
}: {
  onSave: (input: {
    title: string;
    descriptionMd: string | null;
    dueAt: string | null;
    xpReward: number;
  }) => void;
  onCancel: () => void;
  busy: boolean;
}) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [due, setDue] = useState('');
  const [xp, setXp] = useState('');
  return (
    <div className="rounded-lg border border-dashed bg-muted/20 p-3 space-y-2">
      <div>
        <Label>과제 제목</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 교재 p.30 ~ 35" />
      </div>
      <div>
        <Label>설명</Label>
        <Textarea rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>마감</Label>
          <Input type="datetime-local" value={due} onChange={(e) => setDue(e.target.value)} />
        </div>
        <div>
          <Label>완료 XP</Label>
          <Input type="number" min={0} value={xp} onChange={(e) => setXp(e.target.value)} />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <Button size="sm" variant="ghost" onClick={onCancel} disabled={busy}>취소</Button>
        <Button
          size="sm"
          disabled={busy || !title.trim()}
          onClick={() =>
            onSave({
              title: title.trim(),
              descriptionMd: desc.trim() || null,
              dueAt: due ? new Date(due).toISOString() : null,
              xpReward: xp ? Math.max(0, Math.round(Number(xp))) : 0,
            })
          }
        >
          추가
        </Button>
      </div>
    </div>
  );
}

/** 지난 과제 점검 — junction 으로 묶인 여러 과거 과제. + 로 계속 추가 가능. */
function PastReviews({
  sessionId,
  orgId,
  tenantId,
  reviewIds,
}: {
  sessionId: string;
  orgId: string;
  tenantId: string;
  reviewIds: string[];
}) {
  const qc = useQueryClient();
  // 신규 빈 picker 추가 — 사용자가 어떤 과제를 고를 때까지 잠시 클라이언트 only.
  const [drafts, setDrafts] = useState<{ key: string; assignmentId: string | null }[]>([]);

  const addRow = () => {
    setDrafts((d) => [...d, { key: crypto.randomUUID(), assignmentId: null }]);
  };

  const removeRow = (key: string) => {
    setDrafts((d) => d.filter((x) => x.key !== key));
  };

  const remove = useMutation({
    mutationFn: (assignmentId: string) => removeSessionReview(sessionId, assignmentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['session-review-ids', sessionId] });
      toast.success('점검 해제됨');
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const add = useMutation({
    mutationFn: (assignmentId: string) => addSessionReview(sessionId, assignmentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['session-review-ids', sessionId] });
    },
    onError: (e) => toast.error((e as Error).message),
  });

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">지난 과제 점검</h3>
        <Button size="sm" variant="outline" onClick={addRow}>
          <Plus className="h-3.5 w-3.5" /> 과제 추가
        </Button>
      </div>

      {reviewIds.length === 0 && drafts.length === 0 && (
        <p className="text-xs text-muted-foreground py-2">점검할 지난 과제를 추가하세요.</p>
      )}

      {reviewIds.map((aid) => (
        <div key={aid} className="rounded-lg border bg-card p-3">
          <HomeworkReviewPicker
            orgId={orgId}
            tenantId={tenantId}
            currentSessionId={sessionId}
            value={aid}
            onRemove={() => remove.mutate(aid)}
          />
        </div>
      ))}

      {drafts.map((d) => (
        <div key={d.key} className="rounded-lg border border-dashed bg-muted/20 p-3">
          <HomeworkReviewPicker
            orgId={orgId}
            tenantId={tenantId}
            currentSessionId={sessionId}
            value={d.assignmentId}
            onChange={(aid) => {
              if (aid) {
                add.mutate(aid);
                removeRow(d.key);
              }
            }}
            onRemove={() => removeRow(d.key)}
          />
        </div>
      ))}
    </section>
  );
}

/** 지난 과제 점검 — 같은 반 과거 수업 중 과제가 있는 수업을 골라 학생별로 점검한다. */
function PastHomeworkCheck({
  orgId,
  currentSessionId,
  tenantId,
  defaultAssignmentId,
}: {
  orgId: string;
  currentSessionId: string;
  tenantId: string;
  defaultAssignmentId: string | null;
}) {
  // 수업이 점검 대상을 명시(reviewed_assignment_id) 한 경우 그 과제를 기본 선택.
  const [picked, setPicked] = useState<string | null>(defaultAssignmentId);
  return (
    <Card>
      <CardHeader>
        <CardTitle>지난 과제 점검</CardTitle>
        <CardDescription>
          {defaultAssignmentId
            ? '이 수업에서 점검한 과제 — 다른 수업의 과제로 바꿔 점검할 수도 있습니다.'
            : '이전 수업의 과제를 불러와 학생별로 점검합니다.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <HomeworkReviewPicker
          orgId={orgId}
          tenantId={tenantId}
          currentSessionId={currentSessionId}
          value={picked}
          onChange={(aid) => setPicked(aid)}
        />
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
  const [form, setForm] = useState({
    session_date: session.session_date,
    start_time: session.start_time ?? '',
    end_time: session.end_time ?? '',
    topic: session.topic ?? '',
    subject_id: session.subject_id,
    content_md: session.content_md ?? '',
  });
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
        <p className="rounded-md border border-dashed bg-muted/20 p-3 text-xs text-muted-foreground">
          이번 수업의 과제·지난 과제 점검은 수업 상세 화면의 ‘과제 점검’ 카드에서 +로 추가/관리합니다.
        </p>
      </div>
      <DialogFooter>
        <Button disabled={busy} onClick={submit}>
          저장
        </Button>
      </DialogFooter>
    </>
  );
}
