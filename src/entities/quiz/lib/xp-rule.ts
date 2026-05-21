import type { QuizXpRule } from '@/shared/types/database';

/**
 * 퀴즈 점수에 XP 변환 규칙을 적용해 지급할 XP 를 계산.
 *
 * - proportional: round(maxXp × score/maxScore)
 * - cutoff: score ≥ threshold ? xp : 0
 * - bands: minScore 내림차순 평가, 처음 매치되는 밴드의 xp.
 *
 * score 가 null/NaN 이면 0 반환.
 */
export function computeQuizXp(rule: QuizXpRule, score: number | null, maxScore: number): number {
  if (score == null || Number.isNaN(score)) return 0;
  const safeMax = Math.max(1, maxScore);
  switch (rule.kind) {
    case 'proportional':
      return Math.max(0, Math.round(((rule.maxXp ?? 0) * Math.max(0, score)) / safeMax));
    case 'cutoff':
      return score >= (rule.threshold ?? 0) ? Math.max(0, Math.round(rule.xp ?? 0)) : 0;
    case 'bands': {
      const sorted = [...(rule.bands ?? [])].sort((a, b) => b.minScore - a.minScore);
      for (const b of sorted) {
        if (score >= b.minScore) return Math.max(0, Math.round(b.xp));
      }
      return 0;
    }
    default:
      return 0;
  }
}

/** 사람이 읽기 쉬운 규칙 설명. 미리보기 박스용. */
export function describeXpRule(rule: QuizXpRule): string {
  switch (rule.kind) {
    case 'proportional':
      return `비례 — 만점 시 ${rule.maxXp ?? 0} XP`;
    case 'cutoff':
      return `${rule.threshold ?? 0}점 이상 → ${rule.xp ?? 0} XP, 미만은 0`;
    case 'bands': {
      const sorted = [...(rule.bands ?? [])].sort((a, b) => b.minScore - a.minScore);
      if (sorted.length === 0) return '구간 미설정';
      return sorted.map((b) => `${b.minScore}점↑ → ${b.xp} XP`).join(' · ');
    }
    default:
      return '미설정';
  }
}
