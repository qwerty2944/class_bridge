import 'dart:async';

import 'package:flutter/widgets.dart';
import 'package:go_router/go_router.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../infrastructure/supabase/supabase_providers.dart';
import '../assignment/pages/assignment_detail_page.dart';
import '../assignment/pages/assignment_new_page.dart';
import '../assignment/pages/assignments_page.dart';
import '../auth/controllers/auth_controller.dart';
import '../auth/pages/login_page.dart';
import '../auth/pages/signup_page.dart';
import '../auth/pages/splash_page.dart';
import '../board/pages/board_page.dart';
import '../board/pages/post_detail_page.dart';
import '../board/pages/post_new_page.dart';
import '../class_session/pages/class_detail_page.dart';
import '../class_session/pages/class_new_page.dart';
import '../class_session/pages/classes_page.dart';
import '../dashboard/pages/dashboard_page.dart';
import '../more/pages/more_page.dart';
import '../organization/pages/org_detail_page.dart';
import '../organization/pages/orgs_page.dart';
import '../character/pages/character_page.dart';
import '../character/pages/shop_page.dart';
import '../settings/pages/settings_page.dart';
import '../setup/pages/setup_page.dart';
import '../shell/main_shell.dart';
import 'routes.dart';

part 'app_router.g.dart';

final _rootKey = GlobalKey<NavigatorState>();

/// 인증 상태 기반 GoRouter. 로그인 후엔 StatefulShellRoute 로 바텀 네비를 구성한다.
/// 멤버십(테넌트 0)까지 확인해 온보딩(/setup)으로 보낸다.
@Riverpod(keepAlive: true)
GoRouter router(Ref ref) {
  final supabase = ref.watch(supabaseClientProvider);
  final refresh = _AuthRefreshNotifier(supabase.auth.onAuthStateChange);
  ref.onDispose(refresh.dispose);

  // 멤버십 로딩 완료/변경 시에도 redirect 재평가 (승인 직후 자동 이동 등).
  ref.listen(authControllerProvider, (previous, next) => refresh.ping());

  return GoRouter(
    navigatorKey: _rootKey,
    initialLocation: AppRoute.splash,
    refreshListenable: refresh,
    redirect: (context, state) {
      final loggedIn = supabase.auth.currentSession != null;
      final location = state.matchedLocation;
      const authPages = {AppRoute.login, AppRoute.signup};

      if (!loggedIn) {
        return authPages.contains(location) ? null : AppRoute.login;
      }

      // 멤버십은 비동기 로딩 — 확정 전엔 스플래시에서 대기.
      final user = ref.read(authControllerProvider).asData?.value;

      if (location == AppRoute.splash) {
        if (user == null) return null;
        return user.tenants.isEmpty ? AppRoute.setup : AppRoute.dashboard;
      }
      if (authPages.contains(location)) {
        if (user == null) return AppRoute.splash;
        return user.tenants.isEmpty ? AppRoute.setup : AppRoute.dashboard;
      }
      // 테넌트 0 인데 앱 내부 진입 시도 → 온보딩으로.
      // (/setup 자체는 항상 허용 — 기존 유저의 '학원 추가·합류' 재방문 지원)
      if (user != null &&
          user.tenants.isEmpty &&
          location != AppRoute.setup) {
        return AppRoute.setup;
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
        path: AppRoute.signup,
        builder: (context, state) => const SignupPage(),
      ),
      GoRoute(
        path: AppRoute.setup,
        builder: (context, state) => const SetupPage(),
      ),
      GoRoute(
        path: AppRoute.settings,
        builder: (context, state) => const SettingsPage(),
      ),
      GoRoute(
        path: AppRoute.character,
        builder: (context, state) => const CharacterPage(),
      ),
      GoRoute(
        path: AppRoute.shop,
        builder: (context, state) => const ShopPage(),
      ),
      GoRoute(
        path: AppRoute.orgs,
        builder: (context, state) => const OrgsPage(),
        routes: [
          GoRoute(
            path: ':id',
            builder: (context, state) =>
                OrgDetailPage(orgId: state.pathParameters['id']!),
          ),
        ],
      ),
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) =>
            MainShell(navigationShell: navigationShell),
        branches: [
          StatefulShellBranch(routes: [
            GoRoute(
              path: AppRoute.dashboard,
              builder: (context, state) => const DashboardPage(),
            ),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
              path: AppRoute.classes,
              builder: (context, state) => const ClassesPage(),
              routes: [
                GoRoute(
                  path: 'new',
                  parentNavigatorKey: _rootKey,
                  builder: (context, state) => const ClassNewPage(),
                ),
                GoRoute(
                  path: ':id',
                  builder: (context, state) =>
                      ClassDetailPage(sessionId: state.pathParameters['id']!),
                ),
              ],
            ),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
              path: AppRoute.assignments,
              builder: (context, state) => const AssignmentsPage(),
              routes: [
                GoRoute(
                  path: 'new',
                  parentNavigatorKey: _rootKey,
                  builder: (context, state) => const AssignmentNewPage(),
                ),
                GoRoute(
                  path: ':id',
                  builder: (context, state) => AssignmentDetailPage(
                    assignmentId: state.pathParameters['id']!,
                  ),
                ),
              ],
            ),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
              path: AppRoute.board,
              builder: (context, state) => const BoardPage(),
              routes: [
                GoRoute(
                  path: 'new',
                  builder: (context, state) => const PostNewPage(),
                ),
                GoRoute(
                  path: ':id',
                  builder: (context, state) =>
                      PostDetailPage(postId: state.pathParameters['id']!),
                ),
              ],
            ),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
              path: AppRoute.more,
              builder: (context, state) => const MorePage(),
            ),
          ]),
        ],
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

  /// 인증 외 신호(멤버십 로딩 완료 등)로 redirect 재평가를 트리거.
  void ping() => notifyListeners();

  @override
  void dispose() {
    _subscription.cancel();
    super.dispose();
  }
}
