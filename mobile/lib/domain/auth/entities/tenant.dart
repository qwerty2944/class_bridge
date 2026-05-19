import 'package:freezed_annotation/freezed_annotation.dart';

part 'tenant.freezed.dart';

/// 학원(테넌트) 도메인 엔티티.
@freezed
abstract class Tenant with _$Tenant {
  const factory Tenant({
    required String id,
    required String name,
    required String slug,
    required String type,
  }) = _Tenant;
}
