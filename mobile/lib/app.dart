import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'presentation/router/app_router.dart';
import 'presentation/theme/app_theme.dart';

/// 루트 위젯 — GoRouter 와 테마를 연결한다.
class ClassBridgeApp extends ConsumerWidget {
  const ClassBridgeApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return MaterialApp.router(
      title: 'Class Bridge',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      routerConfig: ref.watch(routerProvider),
    );
  }
}
