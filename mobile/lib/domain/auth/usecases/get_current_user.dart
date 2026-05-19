import '../entities/app_user.dart';
import '../repositories/auth_repository.dart';

/// 현재 로그인된 사용자 조회 유스케이스(앱 시작 시 세션 복원용).
class GetCurrentUser {
  const GetCurrentUser(this._repository);

  final AuthRepository _repository;

  Future<AppUser?> call() => _repository.currentUser();
}
