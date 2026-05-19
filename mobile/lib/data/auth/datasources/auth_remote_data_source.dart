import 'package:supabase_flutter/supabase_flutter.dart';

/// supabase_flutter SDK 의 인증 기능을 감싸는 원격 데이터소스.
/// 세션/토큰 관리는 SDK 에 위임한다.
class AuthRemoteDataSource {
  const AuthRemoteDataSource(this._supabase);

  final SupabaseClient _supabase;

  Future<AuthResponse> signIn({
    required String email,
    required String password,
  }) {
    return _supabase.auth.signInWithPassword(email: email, password: password);
  }

  Future<void> signOut() => _supabase.auth.signOut();

  User? get currentAuthUser => _supabase.auth.currentUser;

  /// 세션 존재 여부 스트림.
  Stream<bool> authStateChanges() =>
      _supabase.auth.onAuthStateChange.map((state) => state.session != null);
}
