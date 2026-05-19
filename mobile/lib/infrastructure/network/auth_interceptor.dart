import 'package:dio/dio.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../env/env.dart';

/// 모든 PostgREST(Retrofit) 요청에 Supabase 인증 헤더를 주입한다.
/// 로그인 전이면 anon key 로, 로그인 후면 세션 JWT 로 호출된다.
class SupabaseAuthInterceptor extends Interceptor {
  SupabaseAuthInterceptor(this._supabase);

  final SupabaseClient _supabase;

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    final accessToken = _supabase.auth.currentSession?.accessToken;
    options.headers['apikey'] = Env.supabaseAnonKey;
    options.headers['Authorization'] =
        'Bearer ${accessToken ?? Env.supabaseAnonKey}';
    handler.next(options);
  }
}
