import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

part 'supabase_providers.g.dart';

/// 앱 전역 Supabase 클라이언트. `main()` 의 `Supabase.initialize` 이후 유효.
@Riverpod(keepAlive: true)
SupabaseClient supabaseClient(Ref ref) => Supabase.instance.client;
