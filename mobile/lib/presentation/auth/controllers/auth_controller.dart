import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../data/auth/repositories/auth_repository_impl.dart';
import '../../../domain/auth/entities/app_user.dart';
import '../../../domain/auth/usecases/get_current_user.dart';
import '../../../domain/auth/usecases/sign_in.dart';
import '../../../domain/auth/usecases/sign_out.dart';

part 'auth_controller.g.dart';

/// 인증 상태 컨트롤러. `AsyncValue<AppUser?>` 로 로딩/에러/데이터를 표현한다.
/// 에러는 [Failure] 로 표면화되어 UI 가 `.message` 를 읽는다.
@riverpod
class AuthController extends _$AuthController {
  @override
  Future<AppUser?> build() {
    final repository = ref.watch(authRepositoryProvider);
    return GetCurrentUser(repository).call();
  }

  Future<void> signIn({required String email, required String password}) async {
    final repository = ref.read(authRepositoryProvider);
    state = const AsyncValue<AppUser?>.loading();
    state = await AsyncValue.guard<AppUser?>(
      () => SignIn(repository).call(email: email, password: password),
    );
  }

  Future<void> signOut() async {
    final repository = ref.read(authRepositoryProvider);
    state = const AsyncValue<AppUser?>.loading();
    state = await AsyncValue.guard<AppUser?>(() async {
      await SignOut(repository).call();
      return null;
    });
  }
}
