import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'app.dart';
import 'infrastructure/env/env.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  assert(
    Env.isConfigured,
    'SUPABASE_URL / SUPABASE_ANON_KEY 누락 — '
    'flutter run --dart-define-from-file=env.json 으로 실행하세요.',
  );

  await Supabase.initialize(
    url: Env.supabaseUrl,
    anonKey: Env.supabaseAnonKey,
  );

  runApp(const ProviderScope(child: ClassBridgeApp()));
}
