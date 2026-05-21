'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, BookCheck, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { Input } from '@/shared/ui/input';
import { Skeleton } from '@/shared/ui/skeleton';
import { useCurrentTenant } from '@/features/tenant-switch';
import {
  computeQuizXp,
  deleteQuiz,
  describeXpRule,
  fetchQuiz,
  fetchQuizScores,
  setQuizScore,
  type QuizScoreWithStudent,
} from '@/entities/quiz';
import { useRouter } from 'next/navigation';

export function QuizDetailClient({ quizId }: { quizId: string }) {
  const router = useRouter();
  const { tenantId, has } = useCurrentTenant();
  const canEdit = has('director') || has('teacher');
  const qc = useQueryClient();

  const qQ = useQuery({ queryKey: ['quiz', quizId], queryFn: () => fetchQuiz(quizId) });
  const sQ = useQuery({
    queryKey: ['quiz-scores', quizId],
    queryFn: () => fetchQuizScores(quizId),
  });

  const save = useMutation({
    mutationFn: async (args: { row: QuizScoreWithStudent; score: number | null }) => {
      if (!tenantId || !qQ.data) return null;
      return setQuizScore({
        scoreId: args.row.id,
        quizId,
        studentUserId: args.row.student_id,
        studentFullName: args.row.student?.full_name ?? null,
        tenantId,
        score: args.score,
        maxScore: qQ.data.max_score,
        xpRule: qQ.data.xp_rule,
      });
    },
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ['quiz-scores', quizId] });
      qc.invalidateQueries({ queryKey: ['character'] });
      if (r && r.xpAdded !== 0) {
        toast.success(
          r.leveledUp
            ? `점수 저장! ${r.xpAdded > 0 ? '+' : ''}${r.xpAdded} XP — Lv.${r.oldLevel}→Lv.${r.newLevel}`
            : `점수 저장 — ${r.xpAdded > 0 ? '+' : ''}${r.xpAdded} XP`,
        );
      } else {
        toast.success('점수 저장됨');
      }
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const del = useMutation({
    mutationFn: () => deleteQuiz(quizId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quizzes-multi'] });
      toast.success('퀴즈 삭제됨');
      router.push('/quizzes');
    },
    onError: (e) => toast.error((e as Error).message),
  });

  if (qQ.isLoading || !qQ.data) return <Skeleton className="h-40" />;
  const q = qQ.data;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/quizzes">
          <ArrowLeft className="h-4 w-4" /> 퀴즈 목록
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookCheck className="h-5 w-5 text-muted-foreground" /> {q.name}
                {q.subject && <Badge variant="secondary">{q.subject.name}</Badge>}
              </CardTitle>
              <CardDescription className="mt-1">
                {new Date(q.quiz_date).toLocaleDateString('ko-KR')} · 만점 {q.max_score}점
              </CardDescription>
            </div>
            {canEdit && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (confirm('이 퀴즈를 삭제할까요? 학생 점수·XP 기록도 함께 사라집니다.'))
                    del.mutate();
                }}
              >
                <Trash2 className="h-4 w-4" /> 삭제
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border bg-muted/30 p-3 text-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              XP 규칙
            </p>
            <p className="mt-1">{describeXpRule(q.xp_rule)}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>학생별 점수</CardTitle>
          <CardDescription>
            {canEdit ? '점수를 입력하면 XP 가 규칙에 따라 자동 지급됩니다.' : '내 점수'}
          </CardDescription>
        </CardHeader>
        <CardContent className="divide-y">
          {sQ.isLoading ? (
            <Skeleton className="h-24" />
          ) : sQ.data?.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">학생이 없습니다.</p>
          ) : (
            sQ.data?.map((row) => {
              const previewXp =
                row.score == null ? 0 : computeQuizXp(q.xp_rule, row.score, q.max_score);
              return (
                <div key={row.id} className="flex items-center gap-3 py-3 flex-wrap">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{row.student?.full_name?.slice(0, 1) ?? '?'}</AvatarFallback>
                  </Avatar>
                  <Link
                    href={`/students/${row.student_id}`}
                    className="flex-1 min-w-0 hover:underline"
                  >
                    <p className="text-sm font-medium truncate">{row.student?.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{row.student?.email}</p>
                  </Link>
                  {canEdit ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={0}
                        max={q.max_score}
                        defaultValue={row.score ?? ''}
                        placeholder="점수"
                        className="w-24"
                        onBlur={(e) => {
                          const raw = e.target.value;
                          const next =
                            raw === ''
                              ? null
                              : Math.max(0, Math.min(q.max_score, Math.round(Number(raw))));
                          if (next !== (row.score ?? null)) {
                            save.mutate({ row, score: next });
                          }
                        }}
                      />
                      <Badge variant={row.score == null ? 'outline' : 'default'}>
                        {row.score == null ? '미입력' : `+${previewXp} XP`}
                      </Badge>
                    </div>
                  ) : (
                    <Badge variant={row.score == null ? 'outline' : 'default'}>
                      {row.score == null ? '미입력' : `${row.score}점 · +${row.xp_awarded} XP`}
                    </Badge>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
