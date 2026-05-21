'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { ArrowLeft, CalendarClock, ClipboardList } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Skeleton } from '@/shared/ui/skeleton';
import {
  fetchAssignment,
  fetchMySubmission,
  fetchSubmissions,
  gradeSubmission,
  setSubmissionApproved,
  setSubmissionQuality,
  submitAssignment,
  updateAssignment,
} from '@/entities/assignment';
import { awardForGrade } from '@/entities/reward';
import { useCurrentTenant } from '@/features/tenant-switch';
import { SUBMISSION_LABEL, SUBMISSION_QUALITY_LABEL, type SubmissionQuality } from '@/shared/types/database';
import { cn } from '@/shared/lib/utils';

export function AssignmentDetailClient({ assignmentId }: { assignmentId: string }) {
  const { has, userId, tenantId } = useCurrentTenant();
  const isStudent = has('student') && !has('teacher') && !has('director');
  const canGrade = has('director') || has('teacher');
  const qc = useQueryClient();

  const aQ = useQuery({ queryKey: ['assignment', assignmentId], queryFn: () => fetchAssignment(assignmentId) });

  const updateXp = useMutation({
    mutationFn: (xp: number) => updateAssignment(assignmentId, { xp_reward: xp }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assignment', assignmentId] });
      toast.success('지급 경험치가 저장되었습니다.');
    },
    onError: (e) => toast.error((e as Error).message),
  });

  if (aQ.isLoading || !aQ.data) return <Skeleton className="h-40" />;
  const a = aQ.data;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/assignments">
          <ArrowLeft className="h-4 w-4" /> 과제 목록
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-muted-foreground" />
            <CardTitle>{a.title}</CardTitle>
            {a.subject && <Badge variant="secondary">{a.subject.name}</Badge>}
            <Badge variant="outline">{a.xp_reward} XP</Badge>
          </div>
          <CardDescription className="flex items-center gap-2">
            {a.due_at && (
              <span className="inline-flex items-center gap-1 text-amber-600">
                <CalendarClock className="h-3.5 w-3.5" /> 마감 {new Date(a.due_at).toLocaleString('ko-KR')}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="whitespace-pre-wrap text-sm">{a.description_md ?? '—'}</p>
          {canGrade && (
            <div className="flex items-center gap-2 border-t pt-3">
              <Label className="text-xs whitespace-nowrap">완료 시 지급 경험치(XP)</Label>
              <Input
                type="number"
                min={0}
                className="h-8 w-24"
                defaultValue={a.xp_reward}
                onBlur={(e) => {
                  const v = Math.max(0, Math.round(Number(e.target.value) || 0));
                  if (v !== a.xp_reward) updateXp.mutate(v);
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {isStudent && userId && <StudentSubmit assignmentId={assignmentId} studentId={userId} />}
      {canGrade && tenantId && (
        <TeacherGrading assignmentId={assignmentId} tenantId={tenantId} xpReward={a.xp_reward} />
      )}
    </div>
  );
}

function StudentSubmit({ assignmentId, studentId }: { assignmentId: string; studentId: string }) {
  const qc = useQueryClient();
  const subQ = useQuery({
    queryKey: ['submission', assignmentId, studentId],
    queryFn: () => fetchMySubmission(assignmentId, studentId),
  });
  const [content, setContent] = useState('');
  const [file, setFile] = useState('');
  const [busy, setBusy] = useState(false);

  const sub = subQ.data;

  const submit = async () => {
    setBusy(true);
    try {
      await submitAssignment({
        assignment_id: assignmentId,
        student_id: studentId,
        content_md: content || sub?.content_md || undefined,
        file_url: file || sub?.file_url || undefined,
      });
      qc.invalidateQueries({ queryKey: ['submission', assignmentId, studentId] });
      toast.success('제출 완료');
      setContent('');
      setFile('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>내 제출</CardTitle>
        <CardDescription>
          상태: <Badge variant="secondary">{sub ? SUBMISSION_LABEL[sub.status] : '미제출'}</Badge>
          {sub?.score != null && <span className="ml-2">점수: <b>{sub.score}</b></span>}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {sub?.feedback_md && (
          <div className="p-3 rounded-md bg-amber-50 border border-amber-200 text-sm">
            <p className="text-xs text-amber-700 mb-1">선생님 피드백</p>
            <p className="whitespace-pre-wrap">{sub.feedback_md}</p>
          </div>
        )}
        <div>
          <Label>제출 내용</Label>
          <Textarea
            rows={4}
            defaultValue={sub?.content_md ?? ''}
            onChange={(e) => setContent(e.target.value)}
            placeholder="텍스트로 답안 작성"
          />
        </div>
        <div>
          <Label>파일 URL (선택)</Label>
          <Input defaultValue={sub?.file_url ?? ''} onChange={(e) => setFile(e.target.value)} placeholder="https://..." />
        </div>
        <Button onClick={submit} disabled={busy}>
          {sub?.status === 'submitted' || sub?.status === 'graded' ? '다시 제출' : '제출하기'}
        </Button>
      </CardContent>
    </Card>
  );
}

function TeacherGrading({
  assignmentId,
  tenantId,
  xpReward,
}: {
  assignmentId: string;
  tenantId: string;
  xpReward: number;
}) {
  const qc = useQueryClient();
  const sQ = useQuery({
    queryKey: ['submissions', assignmentId],
    queryFn: () => fetchSubmissions(assignmentId),
  });

  const handleGradeWithReward = async (
    submission: { id: string; student_id: string; student?: { full_name?: string | null } },
    score: number | null,
    feedback: string | null,
  ) => {
    await gradeSubmission(submission.id, score, feedback);
    if (score != null) {
      const r = await awardForGrade({
        tenantId,
        studentUserId: submission.student_id,
        studentFullName: submission.student?.full_name ?? null,
        submissionId: submission.id,
        score,
        xpReward,
      });
      if (r && (r.xpAdded > 0 || r.coinsAdded > 0)) {
        toast.success(
          r.leveledUp
            ? `🎉 채점 완료! +${r.xpAdded} XP, +${r.coinsAdded} 코인 — Lv.${r.oldLevel}→Lv.${r.newLevel}`
            : `채점 완료! +${r.xpAdded} XP, +${r.coinsAdded} 코인`,
        );
      } else {
        toast.success('채점됨');
      }
    } else {
      toast.success('채점됨');
    }
    qc.invalidateQueries({ queryKey: ['submissions', assignmentId] });
    qc.invalidateQueries({ queryKey: ['character'] });
  };

  // 4-state 등급 변경 — 확정 여부와 무관하게 quality 만 저장. 이미 확정된 행이면 XP delta 자동 적용.
  const qualityMutation = useMutation({
    mutationFn: (args: {
      submissionId: string;
      studentId: string;
      studentFullName: string | null;
      quality: SubmissionQuality;
    }) =>
      setSubmissionQuality({
        submissionId: args.submissionId,
        tenantId,
        studentUserId: args.studentId,
        studentFullName: args.studentFullName,
        quality: args.quality,
        xpReward,
      }),
    onSuccess: (r, vars) => {
      qc.invalidateQueries({ queryKey: ['submissions', assignmentId] });
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

  // 승인 토글 — status 를 graded/pending 전환하고 현재 quality 기준 XP 지급/회수.
  const approveMutation = useMutation({
    mutationFn: (args: {
      submissionId: string;
      studentId: string;
      studentFullName: string | null;
      approved: boolean;
      quality: SubmissionQuality;
    }) =>
      setSubmissionApproved({
        submissionId: args.submissionId,
        tenantId,
        studentUserId: args.studentId,
        studentFullName: args.studentFullName,
        approved: args.approved,
        quality: args.quality,
        xpReward,
      }),
    onSuccess: (r, vars) => {
      qc.invalidateQueries({ queryKey: ['submissions', assignmentId] });
      qc.invalidateQueries({ queryKey: ['character'] });
      if (r && r.xpAdded !== 0) {
        toast.success(
          r.leveledUp
            ? `확정! ${r.xpAdded > 0 ? '+' : ''}${r.xpAdded} XP — Lv.${r.oldLevel}→Lv.${r.newLevel}`
            : vars.approved
              ? `확정 — +${r.xpAdded} XP`
              : `확정 해제 — ${r.xpAdded} XP`,
        );
      } else {
        toast.success(vars.approved ? '확정됨' : '확정 해제됨');
      }
    },
    onError: (e) => toast.error((e as Error).message),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>학생 제출 / 채점</CardTitle>
      </CardHeader>
      <CardContent className="divide-y">
        {sQ.isLoading ? (
          <Skeleton className="h-24" />
        ) : sQ.data?.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">학생이 없습니다.</p>
        ) : (
          sQ.data?.map((s) => {
            const studentSubmitted = s.status === 'submitted';
            return (
            <div key={s.id} className="py-3 space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{s.student?.full_name?.slice(0, 1) ?? '?'}</AvatarFallback>
                </Avatar>
                <Link href={`/students/${s.student_id}`} className="flex-1 min-w-0 hover:underline">
                  <p className="text-sm font-medium truncate">{s.student?.full_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{s.student?.email}</p>
                </Link>
                {studentSubmitted && (
                  <Badge variant="outline" className="border-amber-400 text-amber-700">
                    학생 제출
                  </Badge>
                )}
                {/* 승인 = 현재 quality 로 확정/해제. status='graded' 이면 default variant 로 강조. */}
                <Button
                  size="sm"
                  variant={s.status === 'graded' ? 'default' : 'outline'}
                  onClick={() =>
                    approveMutation.mutate({
                      submissionId: s.id,
                      studentId: s.student_id,
                      studentFullName: s.student?.full_name ?? null,
                      approved: s.status !== 'graded',
                      quality: s.quality,
                    })
                  }
                >
                  {s.status === 'graded' ? '확정됨' : '승인'}
                </Button>
                <QualitySegmented
                  value={s.quality}
                  onChange={(q) =>
                    qualityMutation.mutate({
                      submissionId: s.id,
                      studentId: s.student_id,
                      studentFullName: s.student?.full_name ?? null,
                      quality: q,
                    })
                  }
                />
              </div>
              {s.content_md && (
                <p className="text-sm whitespace-pre-wrap pl-11 text-muted-foreground">{s.content_md}</p>
              )}
              {s.file_url && (
                <a href={s.file_url} target="_blank" rel="noreferrer" className="pl-11 text-xs underline">
                  첨부 보기
                </a>
              )}
              <div className="pl-11 flex items-end gap-2 flex-wrap">
                <div className="w-20">
                  <Label className="text-xs">점수</Label>
                  <Input
                    type="number"
                    defaultValue={s.score ?? ''}
                    onBlur={(e) => {
                      const v = e.target.value === '' ? null : Number(e.target.value);
                      if (v !== (s.score ?? null)) {
                        handleGradeWithReward(s, v, s.feedback_md ?? null);
                      }
                    }}
                  />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <Label className="text-xs">피드백</Label>
                  <Input
                    defaultValue={s.feedback_md ?? ''}
                    onBlur={(e) => {
                      if ((e.target.value || '') !== (s.feedback_md ?? '')) {
                        handleGradeWithReward(s, s.score, e.target.value || null);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

// 과제 점검 4단계 segmented control — 수업 출결 / 지난 과제 점검 / 과제 상세 어디서든 재사용.
const QUALITY_OPTIONS: { value: SubmissionQuality; label: string; tone: string }[] = [
  { value: 'none', label: '안 햇음', tone: 'bg-muted text-foreground' },
  { value: 'partial', label: '햇는데 미흡', tone: 'bg-amber-500 text-white' },
  { value: 'done', label: '햇음', tone: 'bg-emerald-500 text-white' },
  { value: 'excellent', label: '아주 잘 햇음', tone: 'bg-indigo-600 text-white' },
];

export function QualitySegmented({
  value,
  onChange,
}: {
  value: SubmissionQuality;
  onChange: (q: SubmissionQuality) => void;
}) {
  return (
    <div className="inline-flex overflow-hidden rounded-md border bg-background text-xs whitespace-nowrap">
      {QUALITY_OPTIONS.map((opt, i) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'px-2.5 py-1 transition',
              i > 0 && 'border-l',
              active ? opt.tone : 'hover:bg-accent',
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
