// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'reward_event_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_RewardEventDto _$RewardEventDtoFromJson(Map<String, dynamic> json) =>
    _RewardEventDto(
      id: json['id'] as String,
      characterId: json['character_id'] as String,
      source: json['source'] as String,
      sourceRef: json['source_ref'] as String?,
      xpDelta: json['xp_delta'] as num? ?? 0,
      coinDelta: json['coin_delta'] as num? ?? 0,
      note: json['note'] as String?,
    );

Map<String, dynamic> _$RewardEventDtoToJson(_RewardEventDto instance) =>
    <String, dynamic>{
      'id': instance.id,
      'character_id': instance.characterId,
      'source': instance.source,
      'source_ref': instance.sourceRef,
      'xp_delta': instance.xpDelta,
      'coin_delta': instance.coinDelta,
      'note': instance.note,
    };
