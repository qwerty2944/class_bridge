import 'package:freezed_annotation/freezed_annotation.dart';

part 'reward_event_dto.freezed.dart';
part 'reward_event_dto.g.dart';

/// Supabase `reward_events` 행 DTO — XP 지급 ledger.
@freezed
abstract class RewardEventDto with _$RewardEventDto {
  const factory RewardEventDto({
    required String id,
    @JsonKey(name: 'character_id') required String characterId,
    required String source,
    @JsonKey(name: 'source_ref') String? sourceRef,
    @JsonKey(name: 'xp_delta') @Default(0) num xpDelta,
    @JsonKey(name: 'coin_delta') @Default(0) num coinDelta,
    String? note,
  }) = _RewardEventDto;

  factory RewardEventDto.fromJson(Map<String, dynamic> json) =>
      _$RewardEventDtoFromJson(json);
}
