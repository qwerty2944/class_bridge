import '../entities/reward_result.dart';
import '../entities/student_character.dart';

/// XP/코인 지급 도메인 경계 — 웹 `awardForGrade` 대응.
abstract interface class RewardRepository {
  /// 캐릭터 조회, 없으면 기본 외형으로 생성.
  Future<StudentCharacter> ensureCharacter({
    required String tenantId,
    required String userId,
    String? fullName,
  });

  /// 과제 채점 XP 지급 — reward_events 에 idempotent(절대치 갱신 + delta 가감).
  /// 레벨업 시 50코인/레벨 보너스를 level_bonus 이벤트로 기록.
  Future<RewardResult> awardForGrade({
    required String tenantId,
    required String studentUserId,
    String? studentFullName,
    required String submissionId,
    required num score,
    required int xpReward,
  });
}
