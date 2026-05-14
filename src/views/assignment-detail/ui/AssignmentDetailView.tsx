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
  submitAssignment,
} from '@/entities/assignment';
import { awardForGrade } from '@/entities/reward';
import { useCurrentTenant } from '@/features/tenant-switch';
import { SUBMISSION_LABEL } from '@/shared/types/database';

export function AssignmentDetailClient({ assignmentId }: { assignmentId: string }) {
  const { has, userId } = useCurrentTenant();
  const isStudent = has('student') && !has('teacher') && !has('director');
  const canGrade = has('director') || has('teacher');

  const aQ = useQuery({ queryKey: ['assignment', assignmentId], queryFn: () => fetchAssignment(assignmentId) });
  const { tenantId } = useCurrentTenant();

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
          </div>
          <CardDescription className="flex items-center gap-2">
            {a.due_at && (
              <span className="inline-flex items-center gap-1 text-amber-600">
                <CalendarClock className="h-3.5 w-3.5" /> 마감 {new Date(a.due_at).toLocaleString('ko-KR')}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm">{a.description_md ?? '—'}</p>
        </CardContent>
      </Card>

      {isStudent && userId && <StudentSubmit assignmentId={assignmentId} studentId={userId} />}
      {canGrade && tenantId && <TeacherGrading assignmentId={assignmentId} tenantId={tenantId} dueAt={a.due_at} />}
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
  dueAt,
}: {
  assignmentId: string;
  tenantId: string;
  dueAt: string | null;
}) {
  const qc = useQueryClient();
  const sQ = useQuery({
    queryKey: ['submissions', assignmentId],
    queryFn: () => fetchSubmissions(assignmentId),
  });

  const handleGradeWithReward = async (
    submission: { id: string; student_id: string; submitted_at: string | null; student?: { full_name?: string | null } },
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
        dueAt,
        submittedAt: submission.submitted_at,
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
          sQ.data?.map((s) => (
            <div key={s.id} className="py-3 space-y-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{s.student?.full_name?.slice(0, 1) ?? '?'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{s.student?.full_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{s.student?.email}</p>
                </div>
                <Badge variant={s.status === 'graded' ? 'default' : 'secondary'}>{SUBMISSION_LABEL[s.status]}</Badge>
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
          ))
        )}
      </CardContent>
    </Card>
  );
}
