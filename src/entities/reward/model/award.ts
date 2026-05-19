'use client';

import { createClient } from '@/shared/api/supabase/client';
import { ensureCharacter } from '@/entities/character';
import { levelForXp } from './level';

const sb = () => createClient();

export interface RewardResult {
  xpAdded: number;
  coinsAdded: number;
  oldLevel: number;
  newLevel: number;
  leveledUp: boolean;
}

export async function awardForGrade(args: {
  tenantId: string;
  studentUserId: string;
  studentFullName?: string | null;
  submissionId: string;
  score: number;
  xpReward: number;
}): Promise<RewardResult | null> {
  if (args.score == null || isNaN(args.score)) return null;

  const character = await ensureCharacter({
    tenantId: args.tenantId,
    userId: args.studentUserId,
    fullName: args.studentFullName,
  });

  // XP는 과제에 설정된 값(선생님이 정한 값)을 그대로 지급. 코인은 점수 기반 유지.
  const xpEarned = Math.max(0, Math.round(args.xpReward));
  const coinEarned = Math.max(0, Math.round(args.score * 0.2));

  const { data: existing } = await sb()
    .from('reward_events')
    .select('*')
    .eq('character_id', character.id)
    .eq('source', 'assignment_grade')
    .eq('source_ref', args.submissionId)
    .maybeSingle();

  const prevXp = (existing as { xp_delta?: number } | null)?.xp_delta ?? 0;
  const prevCoin = (existing as { coin_delta?: number } | null)?.coin_delta ?? 0;
  const dXp = xpEarned - prevXp;
  const dCoin = coinEarned - prevCoin;

  if (dXp === 0 && dCoin === 0) {
    return { xpAdded: 0, coinsAdded: 0, oldLevel: character.level, newLevel: character.level, leveledUp: false };
  }

  if (existing) {
    await sb()
      .from('reward_events')
      .update({ xp_delta: xpEarned, coin_delta: coinEarned, note: `점수 ${args.score}` })
      .eq('id', (existing as { id: string }).id);
  } else {
    await sb().from('reward_events').insert({
      character_id: character.id,
      source: 'assignment_grade',
      source_ref: args.submissionId,
      xp_delta: xpEarned,
      coin_delta: coinEarned,
      note: `점수 ${args.score}`,
    });
  }

  const newXp = character.xp + dXp;
  let newCoins = character.coins + dCoin;
  const oldLevel = character.level;
  const newLevel = levelForXp(newXp);
  const leveledUp = newLevel > oldLevel;
  if (leveledUp) {
    const bonus = 50 * (newLevel - oldLevel);
    newCoins += bonus;
    await sb().from('reward_events').insert({
      character_id: character.id,
      source: 'level_bonus',
      xp_delta: 0,
      coin_delta: bonus,
      note: `Lv.${oldLevel} → Lv.${newLevel}`,
    });
  }

  await sb()
    .from('student_characters')
    .update({ xp: newXp, coins: newCoins, level: newLevel, updated_at: new Date().toISOString() })
    .eq('id', character.id);

  return { xpAdded: dXp, coinsAdded: dCoin + (leveledUp ? 50 * (newLevel - oldLevel) : 0), oldLevel, newLevel, leveledUp };
}
