// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'tenant_member_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_TenantMemberDto _$TenantMemberDtoFromJson(Map<String, dynamic> json) =>
    _TenantMemberDto(
      id: json['id'] as String,
      tenantId: json['tenant_id'] as String,
      userId: json['user_id'] as String,
      role: json['role'] as String,
      status: json['status'] as String,
      tenant: json['tenant'] == null
          ? null
          : TenantDto.fromJson(json['tenant'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$TenantMemberDtoToJson(_TenantMemberDto instance) =>
    <String, dynamic>{
      'id': instance.id,
      'tenant_id': instance.tenantId,
      'user_id': instance.userId,
      'role': instance.role,
      'status': instance.status,
      'tenant': instance.tenant,
    };
