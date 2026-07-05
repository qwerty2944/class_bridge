/// 앱 라우트 경로 상수.
abstract final class AppRoute {
  static const String splash = '/';
  static const String login = '/login';
  static const String signup = '/signup';

  /// 온보딩 — 학원 만들기/합류. 테넌트 0 이면 redirect 로 강제 진입.
  static const String setup = '/setup';

  // 바텀 네비 브랜치
  static const String dashboard = '/dashboard';
  static const String classes = '/classes';
  static const String assignments = '/assignments';
  static const String board = '/board';
  static const String more = '/more';

  // 상세/작성 (브랜치 하위)
  static String classDetail(String id) => '/classes/$id';
  static String assignmentDetail(String id) => '/assignments/$id';
  static String postDetail(String id) => '/board/$id';
  static const String boardNew = '/board/new';

  // 생성 (루트 push — 바텀 네비를 가리는 풀스크린)
  static const String classNew = '/classes/new';
  static const String assignmentNew = '/assignments/new';

  // 캐릭터/상점 (루트 push)
  static const String character = '/character';
  static const String shop = '/shop';

  // 반(조직) / 설정 (루트 push)
  static const String orgs = '/orgs';
  static String orgDetail(String id) => '/orgs/$id';
  static const String settings = '/settings';
}
