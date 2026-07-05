import 'dart:math';

import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../domain/core/failure.dart';
import '../../../domain/reward/entities/reward_result.dart';
import '../../../domain/reward/entities/student_character.dart';
import '../../../domain/reward/level.dart';
import '../../../domain/reward/repositories/reward_repository.dart';
import '../../../infrastructure/network/dio_provider.dart';
import '../../../infrastructure/network/rest_client.dart';
import '../../common/repository_guard.dart';
import '../models/character_defaults.dart';

part 'reward_repository_impl.g.dart';

/// 웹 `src/entities/reward/model/award.ts` awardForGrade 를 1:1 이식.
/// reward_events 에 (source, source_ref) 로 idempotent — 절대치 갱신 + delta 가감.
class RewardRepositoryImpl implements RewardRepository {
  RewardRepositoryImpl(this._restClient);

  final SupabaseRestClient _restClient;

  @override
  Future<StudentCharacter> ensureCharacter({
    required String tenantId,
    required String userId,
    String? fullName,
  }) {
    return guard(() async {
      final rows = await _restClient.getCharacter(
        tenantId: 'eq.$tenantId',
        userId: 'eq.$userId',
      );
      if (rows.isNotEmpty) return rows.first.toEntity();

      final created = await _restClient.insertCharacter(body: {
        'tenant_id': tenantId,
        'user_id': userId,
        'name': fullName ?? '내 캐릭터',
        'appearance': kDefaultAppearance,
        'colors': kDefaultColors,
      });
      if (created.isEmpty) throw const Failure.server('캐릭터 생성에 실패했습니다.');
      return created.first.toEntity();
    });
  }

  @override
  Future<RewardResult> awardForGrade({
    required String tenantId,
    required String studentUserId,
    String? studentFullName,
    required String submissionId,
    required num score,
    required int xpReward,
  }) {
    return guard(() async {
      final character = await ensureCharacter(
        tenantId: tenantId,
        userId: studentUserId,
        fullName: studentFullName,
      );

      // XP 는 과제 설정값 그대로, 코인은 점수 기반 (웹과 동일).
      final xpEarned = max(0, xpReward);
      final coinEarned = max(0, (score * 0.2).round());

      final existing = await _restClient.getRewardEvents(
        characterId: 'eq.${character.id}',
        source: 'eq.assignment_grade',
        sourceRef: 'eq.$submissionId',
      );
      final prev = existing.isEmpty ? null : existing.first;
      final dXp = xpEarned - (prev?.xpDelta ?? 0).toInt();
      final dCoin = coinEarned - (prev?.coinDelta ?? 0).toInt();

      if (dXp == 0 && dCoin == 0) {
        return RewardResult(
          xpAdded: 0,
          coinsAdded: 0,
          oldLevel: character.level,
          newLevel: character.level,
          leveledUp: false,
        );
      }

      if (prev != null) {
        await _restClient.patchRewardEvent(id: 'eq.${prev.id}', body: {
          'xp_delta': xpEarned,
          'coin_delta': coinEarned,
          'note': '점수 $score',
        });
      } else {
        await _restClient.insertRewardEvent(body: {
          'character_id': character.id,
          'source': 'assignment_grade',
          'source_ref': submissionId,
          'xp_delta': xpEarned,
          'coin_delta': coinEarned,
          'note': '점수 $score',
        });
      }

      final newXp = character.xp + dXp;
      var newCoins = character.coins + dCoin;
      final oldLevel = character.level;
      final newLevel = levelForXp(newXp);
      final leveledUp = newLevel > oldLevel;
      if (leveledUp) {
        final bonus = 50 * (newLevel - oldLevel);
        newCoins += bonus;
        await _restClient.insertRewardEvent(body: {
          'character_id': character.id,
          'source': 'level_bonus',
          'xp_delta': 0,
          'coin_delta': bonus,
          'note': 'Lv.$oldLevel → Lv.$newLevel',
        });
      }

      await _restClient.patchCharacter(id: 'eq.${character.id}', body: {
        'xp': newXp,
        'coins': newCoins,
        'level': newLevel,
        'updated_at': DateTime.now().toUtc().toIso8601String(),
      });

      return RewardResult(
        xpAdded: dXp,
        coinsAdded: dCoin + (leveledUp ? 50 * (newLevel - oldLevel) : 0),
        oldLevel: oldLevel,
        newLevel: newLevel,
        leveledUp: leveledUp,
      );
    });
  }
}

@riverpod
RewardRepository rewardRepository(Ref ref) =>
    RewardRepositoryImpl(ref.watch(supabaseRestClientProvider));
