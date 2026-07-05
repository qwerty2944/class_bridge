import 'package:freezed_annotation/freezed_annotation.dart';

part 'reward_result.freezed.dart';

/// XP 지급 결과 — 웹 RewardResult 대응.
@freezed
abstract class RewardResult with _$RewardResult {
  const factory RewardResult({
    required int xpAdded,
    required int coinsAdded,
    required int oldLevel,
    required int newLevel,
    required bool leveledUp,
  }) = _RewardResult;
}
