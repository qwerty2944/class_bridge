// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'app_router.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning
/// 인증 상태 기반 GoRouter. 로그인 후엔 StatefulShellRoute 로 바텀 네비를 구성한다.
/// 멤버십(테넌트 0)까지 확인해 온보딩(/setup)으로 보낸다.

@ProviderFor(router)
final routerProvider = RouterProvider._();

/// 인증 상태 기반 GoRouter. 로그인 후엔 StatefulShellRoute 로 바텀 네비를 구성한다.
/// 멤버십(테넌트 0)까지 확인해 온보딩(/setup)으로 보낸다.

final class RouterProvider
    extends $FunctionalProvider<GoRouter, GoRouter, GoRouter>
    with $Provider<GoRouter> {
  /// 인증 상태 기반 GoRouter. 로그인 후엔 StatefulShellRoute 로 바텀 네비를 구성한다.
  /// 멤버십(테넌트 0)까지 확인해 온보딩(/setup)으로 보낸다.
  RouterProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'routerProvider',
        isAutoDispose: false,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$routerHash();

  @$internal
  @override
  $ProviderElement<GoRouter> $createElement($ProviderPointer pointer) =>
      $ProviderElement(pointer);

  @override
  GoRouter create(Ref ref) {
    return router(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(GoRouter value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<GoRouter>(value),
    );
  }
}

String _$routerHash() => r'8a12fe9db3699d56658551d745e6a46e05e2ec27';
