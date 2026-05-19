import 'package:freezed_annotation/freezed_annotation.dart';

import '../../../domain/auth/entities/tenant.dart';

part 'tenant_dto.freezed.dart';
part 'tenant_dto.g.dart';

/// Supabase `tenants` 행 DTO.
@freezed
abstract class TenantDto with _$TenantDto {
  const TenantDto._();

  const factory TenantDto({
    required String id,
    required String name,
    required String slug,
    required String type,
  }) = _TenantDto;

  factory TenantDto.fromJson(Map<String, dynamic> json) =>
      _$TenantDtoFromJson(json);

  Tenant toEntity() => Tenant(id: id, name: name, slug: slug, type: type);
}
