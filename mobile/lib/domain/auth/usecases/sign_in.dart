import '../entities/app_user.dart';
import '../repositories/auth_repository.dart';

/// 이메일/비밀번호 로그인 유스케이스.
class SignIn {
  const SignIn(this._repository);

  final AuthRepository _repository;

  Future<AppUser> call({required String email, required String password}) {
    return _repository.signInWithPassword(email: email, password: password);
  }
}
