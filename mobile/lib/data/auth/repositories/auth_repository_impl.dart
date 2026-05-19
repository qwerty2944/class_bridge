import 'package:dio/dio.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../domain/auth/entities/app_user.dart';
import '../../../domain/auth/entities/user_role.dart';
import '../../../domain/auth/repositories/auth_repository.dart';
import '../../../domain/core/failure.dart';
import '../../../infrastructure/network/dio_provider.dart';
import '../../../infrastructure/network/rest_client.dart';
import '../../../infrastructure/supabase/supabase_providers.dart';
import '../datasources/auth_remote_data_source.dart';

part 'auth_repository_impl.g.dart';

/// [AuthRepository] 구현. 인증은 supabase_flutter, 프로필/역할 조회는 Retrofit 사용.
class AuthRepositoryImpl implements AuthRepository {
  AuthRepositoryImpl({
    required AuthRemoteDataSource dataSource,
    required SupabaseRestClient restClient,
  })  : _dataSource = dataSource,
        _restClient = restClient;

  final AuthRemoteDataSource _dataSource;
  final SupabaseRestClient _restClient;

  @override
  Future<AppUser> signInWithPassword({
    required String email,
    required String password,
  }) {
    return _guard(() async {
      final response =
          await _dataSource.signIn(email: email, password: password);
      final user = response.user;
      if (user == null) {
        throw const Failure.auth('로그인에 실패했습니다.');
      }
      return _composeAppUser(user.id, user.email ?? email);
    });
  }

  @override
  Future<void> signOut() => _guard(_dataSource.signOut);

  @override
  Future<AppUser?> currentUser() {
    return _guard<AppUser?>(() async {
      final authUser = _dataSource.currentAuthUser;
      if (authUser == null) return null;
      return _composeAppUser(authUser.id, authUser.email ?? '');
    });
  }

  @override
  Stream<bool> authStateChanges() => _dataSource.authStateChanges();

  /// Retrofit(PostgREST)으로 tenant_members + profile 을 조회해 [AppUser] 합성.
  Future<AppUser> _composeAppUser(String userId, String fallbackEmail) async {
    final members = await _restClient.getTenantMembers(
      userId: 'eq.$userId',
      status: 'eq.active',
    );
    final profiles = await _restClient.getProfiles(id: 'eq.$userId');
    final profile = profiles.isEmpty ? null : profiles.first;

    return AppUser(
      id: userId,
      email: profile?.email ?? fallbackEmail,
      fullName: profile?.fullName,
      roles: members.map((m) => UserRole.fromString(m.role)).toList(),
      tenants: members
          .where((m) => m.tenant != null)
          .map((m) => m.tenant!.toEntity())
          .toList(),
    );
  }

  /// 외부 예외(Supabase/Dio)를 도메인 [Failure] 로 정규화한다.
  Future<T> _guard<T>(Future<T> Function() action) async {
    try {
      return await action();
    } on Failure {
      rethrow;
    } on AuthException catch (e) {
      throw Failure.auth(e.message);
    } on DioException catch (e) {
      if (e.response != null) {
        throw Failure.server('서버 오류 (${e.response?.statusCode}).');
      }
      throw const Failure.network('네트워크 연결을 확인해주세요.');
    } catch (e) {
      throw Failure.unexpected(e.toString());
    }
  }
}

@riverpod
AuthRemoteDataSource authRemoteDataSource(Ref ref) =>
    AuthRemoteDataSource(ref.watch(supabaseClientProvider));

@riverpod
AuthRepository authRepository(Ref ref) => AuthRepositoryImpl(
      dataSource: ref.watch(authRemoteDataSourceProvider),
      restClient: ref.watch(supabaseRestClientProvider),
    );
