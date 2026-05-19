/// 컴파일 타임 환경설정. `--dart-define-from-file=env.json` 으로 주입한다.
abstract final class Env {
  static const String supabaseUrl = String.fromEnvironment('SUPABASE_URL');
  static const String supabaseAnonKey = String.fromEnvironment('SUPABASE_ANON_KEY');

  /// Supabase PostgREST 베이스 URL (Retrofit/Dio 용).
  static String get restBaseUrl => '$supabaseUrl/rest/v1';

  static bool get isConfigured => supabaseUrl.isNotEmpty && supabaseAnonKey.isNotEmpty;
}
