import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:go_router/go_router.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../infrastructure/supabase/supabase_providers.dart';
import '../auth/pages/login_page.dart';
import '../auth/pages/splash_page.dart';
import '../home/pages/home_shell.dart';
import 'routes.dart';

part 'app_router.g.dart';

/// 인증 상태 기반 GoRouter. 세션 유무에 따라 splash/login/home 을 분기한다.
@Riverpod(keepAlive: true)
GoRouter router(Ref ref) {
  final supabase = ref.watch(supabaseClientProvider);
  final refresh = _AuthRefreshNotifier(supabase.auth.onAuthStateChange);
  ref.onDispose(refresh.dispose);

  return GoRouter(
    initialLocation: AppRoute.splash,
    refreshListenable: refresh,
    redirect: (context, state) {
      final loggedIn = supabase.auth.currentSession != null;
      final location = state.matchedLocation;
      if (!loggedIn) {
        return location == AppRoute.login ? null : AppRoute.login;
      }
      if (location == AppRoute.login || location == AppRoute.splash) {
        return AppRoute.home;
      }
      return null;
    },
    routes: [
      GoRoute(
        path: AppRoute.splash,
        builder: (context, state) => const SplashPage(),
      ),
      GoRoute(
        path: AppRoute.login,
        builder: (context, state) => const LoginPage(),
      ),
      GoRoute(
        path: AppRoute.home,
        builder: (context, state) => const HomeShell(),
      ),
    ],
  );
}

/// Supabase 인증 스트림을 GoRouter 의 `refreshListenable` 로 브리지한다.
class _AuthRefreshNotifier extends ChangeNotifier {
  _AuthRefreshNotifier(Stream<dynamic> stream) {
    _subscription = stream.listen((_) => notifyListeners());
  }

  late final StreamSubscription<dynamic> _subscription;

  @override
  void dispose() {
    _subscription.cancel();
    super.dispose();
  }
}
