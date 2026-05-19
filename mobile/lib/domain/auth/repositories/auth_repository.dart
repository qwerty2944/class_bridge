import '../entities/app_user.dart';

/// 인증 도메인 경계. data 계층이 구현하고, presentation 은 이 인터페이스에만 의존한다.
abstract interface class AuthRepository {
  /// 이메일/비밀번호 로그인. 실패 시 [Failure] 를 던진다.
  Future<AppUser> signInWithPassword({
    required String email,
    required String password,
  });

  Future<void> signOut();

  /// 현재 세션의 사용자(없으면 null).
  Future<AppUser?> currentUser();

  /// 인증 상태 변화 스트림 — true 면 로그인 상태.
  Stream<bool> authStateChanges();
}
