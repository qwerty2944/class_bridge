// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'tenant_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_TenantDto _$TenantDtoFromJson(Map<String, dynamic> json) => _TenantDto(
  id: json['id'] as String,
  name: json['name'] as String,
  slug: json['slug'] as String,
  type: json['type'] as String,
);

Map<String, dynamic> _$TenantDtoToJson(_TenantDto instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'slug': instance.slug,
      'type': instance.type,
    };
