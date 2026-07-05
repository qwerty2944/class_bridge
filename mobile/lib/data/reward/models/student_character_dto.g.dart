// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'student_character_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_StudentCharacterDto _$StudentCharacterDtoFromJson(Map<String, dynamic> json) =>
    _StudentCharacterDto(
      id: json['id'] as String,
      tenantId: json['tenant_id'] as String,
      userId: json['user_id'] as String,
      name: json['name'] as String?,
      level: (json['level'] as num?)?.toInt() ?? 1,
      xp: json['xp'] as num? ?? 0,
      coins: json['coins'] as num? ?? 0,
      appearance: json['appearance'] as Map<String, dynamic>?,
      colors: json['colors'] as Map<String, dynamic>?,
    );

Map<String, dynamic> _$StudentCharacterDtoToJson(
  _StudentCharacterDto instance,
) => <String, dynamic>{
  'id': instance.id,
  'tenant_id': instance.tenantId,
  'user_id': instance.userId,
  'name': instance.name,
  'level': instance.level,
  'xp': instance.xp,
  'coins': instance.coins,
  'appearance': instance.appearance,
  'colors': instance.colors,
};
