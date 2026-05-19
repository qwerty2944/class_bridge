// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'profile_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_ProfileDto _$ProfileDtoFromJson(Map<String, dynamic> json) => _ProfileDto(
  id: json['id'] as String,
  email: json['email'] as String?,
  fullName: json['full_name'] as String?,
  avatarUrl: json['avatar_url'] as String?,
);

Map<String, dynamic> _$ProfileDtoToJson(_ProfileDto instance) =>
    <String, dynamic>{
      'id': instance.id,
      'email': instance.email,
      'full_name': instance.fullName,
      'avatar_url': instance.avatarUrl,
    };
