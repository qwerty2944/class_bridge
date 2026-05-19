import 'package:freezed_annotation/freezed_annotation.dart';

import 'tenant_dto.dart';

part 'tenant_member_dto.freezed.dart';
part 'tenant_member_dto.g.dart';

/// Supabase `tenant_members` 행 DTO. `select=*,tenant:tenants(*)` 시 [tenant] 포함.
@freezed
abstract class TenantMemberDto with _$TenantMemberDto {
  const factory TenantMemberDto({
    required String id,
    @JsonKey(name: 'tenant_id') required String tenantId,
    @JsonKey(name: 'user_id') required String userId,
    required String role,
    required String status,
    TenantDto? tenant,
  }) = _TenantMemberDto;

  factory TenantMemberDto.fromJson(Map<String, dynamic> json) =>
      _$TenantMemberDtoFromJson(json);
}
