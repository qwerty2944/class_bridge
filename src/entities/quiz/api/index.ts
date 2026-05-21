'use client';

import { createClient } from '@/shared/api/supabase/client';
import { awardForQuiz } from '@/entities/reward';
import type { Quiz, QuizScore } from '@/shared/types/database';
import { computeQuizXp } from '../lib/xp-rule';
import type { QuizScoreWithStudent, QuizWithSubject } from '../model/types';

const sb = () => createClient();

export async function fetchQuizzes(orgId: string): Promise<QuizWithSubject[]> {
  const { data, error } = await sb()
    .from('quizzes')
    .select('*, subject:subjects(*)')
    .eq('organization_id', orgId)
    .order('quiz_date', { ascending: false });
  if (error) throw error;
  return (data ?? []) as QuizWithSubject[];
}

export async function fetchQuizzesByOrgs(orgIds: string[]) {
  if (!orgIds.length) return [] as (QuizWithSubject & { score_count: number; total: number })[];
  const { data, error } = await sb()
    .from('quizzes')
    .select('*, subject:subjects(*), quiz_scores(id, score)')
    .in('organization_id', orgIds)
    .order('quiz_date', { ascending: false });
  if (error) throw error;
  // 점수 기록률 (score != null 인 개수 / 전체) 을 같이 계산해서 카드에 노출.
  return ((data ?? []) as (QuizWithSubject & {
    quiz_scores: { id: string; score: number | null }[];
  })[]).map((q) => ({
    ...q,
    score_count: q.quiz_scores.filter((s) => s.score !== null).length,
    total: q.quiz_scores.length,
  }));
}

export async function fetchQuiz(id: string): Promise<QuizWithSubject | null> {
  const { data } = await sb()
    .from('quizzes')
    .select('*, subject:subjects(*)')
    .eq('id', id)
    .maybeSingle();
  return (data as QuizWithSubject) ?? null;
}

export async function createQuiz(
  input: Partial<Quiz> & { organization_id: string; name: string },
): Promise<Quiz> {
  const { data, error } = await sb().from('quizzes').insert(input).select().single();
  if (error) throw error;
  // 반의 학생 목록을 가져와 quiz_scores 행을 (score=null) 로 시드.
  const { data: students } = await sb()
    .from('organization_members')
    .select('user_id')
    .eq('organization_id', input.organization_id)
    .eq('role', 'student');
  if (students?.length) {
    await sb()
      .from('quiz_scores')
      .insert(
        (students as { user_id: string }[]).map((s) => ({
          quiz_id: (data as { id: string }).id,
          student_id: s.user_id,
        })),
      );
  }
  return data as Quiz;
}

export async function updateQuiz(id: string, patch: Partial<Quiz>) {
  const { data, error } = await sb().from('quizzes').update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data as Quiz;
}

export async function deleteQuiz(id: string) {
  const { error } = await sb().from('quizzes').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchQuizScores(quizId: string): Promise<QuizScoreWithStudent[]> {
  const { data, error } = await sb()
    .from('quiz_scores')
    .select('*, student:profiles(*)')
    .eq('quiz_id', quizId);
  if (error) throw error;
  return (data ?? []) as QuizScoreWithStudent[];
}

/**
 * 한 학생의 점수를 저장하고 XP 규칙에 따라 보상 적용.
 * score=null 이면 점수 삭제 + XP 회수.
 * awardForQuiz 가 source_ref=score.id 로 idempotent.
 */
export async function setQuizScore(args: {
  scoreId: string;
  quizId: string;
  studentUserId: string;
  studentFullName?: string | null;
  tenantId: string;
  score: number | null;
  maxScore: number;
  xpRule: Quiz['xp_rule'];
}) {
  const xp = args.score == null ? 0 : computeQuizXp(args.xpRule, args.score, args.maxScore);
  const { error } = await sb()
    .from('quiz_scores')
    .update({
      score: args.score,
      xp_awarded: xp,
      recorded_at: args.score == null ? null : new Date().toISOString(),
    })
    .eq('id', args.scoreId);
  if (error) throw error;
  return awardForQuiz({
    tenantId: args.tenantId,
    studentUserId: args.studentUserId,
    studentFullName: args.studentFullName,
    scoreId: args.scoreId,
    xpAmount: xp,
    note: args.score == null ? '점수 삭제' : `${args.score}점`,
  });
}
