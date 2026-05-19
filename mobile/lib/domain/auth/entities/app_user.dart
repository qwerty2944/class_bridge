import 'package:freezed_annotation/freezed_annotation.dart';

import 'tenant.dart';
import 'user_role.dart';

part 'app_user.freezed.dart';

/// 인증된 사용자 도메인 엔티티. profiles + tenant_members 를 합성한 결과.
@freezed
abstract class AppUser with _$AppUser {
  const AppUser._();

  const factory AppUser({
    required String id,
    required String email,
    String? fullName,
    @Default(<UserRole>[]) List<UserRole> roles,
    @Default(<Tenant>[]) List<Tenant> tenants,
  }) = _AppUser;

  /// 원장/선생님 여부.
  bool get isStaff =>
      roles.contains(UserRole.director) || roles.contains(UserRole.teacher);

  /// 대표 역할(없으면 null).
  UserRole? get primaryRole => roles.isEmpty ? null : roles.first;

  String get displayName => fullName?.isNotEmpty == true ? fullName! : email;
}
