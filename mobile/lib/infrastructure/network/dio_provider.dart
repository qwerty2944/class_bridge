import 'package:dio/dio.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../env/env.dart';
import '../supabase/supabase_providers.dart';
import 'auth_interceptor.dart';
import 'rest_client.dart';

part 'dio_provider.g.dart';

/// PostgREST 호출용 Dio. 베이스 URL + 인증 인터셉터 장착.
@Riverpod(keepAlive: true)
Dio dio(Ref ref) {
  final supabase = ref.watch(supabaseClientProvider);
  final dio = Dio(
    BaseOptions(
      baseUrl: Env.restBaseUrl,
      headers: {'Content-Type': 'application/json'},
      connectTimeout: const Duration(seconds: 20),
      receiveTimeout: const Duration(seconds: 20),
    ),
  );
  dio.interceptors.add(SupabaseAuthInterceptor(supabase));
  return dio;
}

/// Retrofit 클라이언트 — 도메인 데이터 CRUD 진입점.
@Riverpod(keepAlive: true)
SupabaseRestClient supabaseRestClient(Ref ref) =>
    SupabaseRestClient(ref.watch(dioProvider));
