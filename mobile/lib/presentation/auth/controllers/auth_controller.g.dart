// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'auth_controller.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning
/// 인증 상태 컨트롤러. `AsyncValue<AppUser?>` 로 로딩/에러/데이터를 표현한다.
/// 에러는 [Failure] 로 표면화되어 UI 가 `.message` 를 읽는다.

@ProviderFor(AuthController)
final authControllerProvider = AuthControllerProvider._();

/// 인증 상태 컨트롤러. `AsyncValue<AppUser?>` 로 로딩/에러/데이터를 표현한다.
/// 에러는 [Failure] 로 표면화되어 UI 가 `.message` 를 읽는다.
final class AuthControllerProvider
    extends $AsyncNotifierProvider<AuthController, AppUser?> {
  /// 인증 상태 컨트롤러. `AsyncValue<AppUser?>` 로 로딩/에러/데이터를 표현한다.
  /// 에러는 [Failure] 로 표면화되어 UI 가 `.message` 를 읽는다.
  AuthControllerProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'authControllerProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$authControllerHash();

  @$internal
  @override
  AuthController create() => AuthController();
}

String _$authControllerHash() => r'ac6fa1ffa7dc9de93fc22f904e93d5af94f0a411';

/// 인증 상태 컨트롤러. `AsyncValue<AppUser?>` 로 로딩/에러/데이터를 표현한다.
/// 에러는 [Failure] 로 표면화되어 UI 가 `.message` 를 읽는다.

abstract class _$AuthController extends $AsyncNotifier<AppUser?> {
  FutureOr<AppUser?> build();
  @$mustCallSuper
  @override
  void runBuild() {
    final ref = this.ref as $Ref<AsyncValue<AppUser?>, AppUser?>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<AsyncValue<AppUser?>, AppUser?>,
              AsyncValue<AppUser?>,
              Object?,
              Object?
            >;
    element.handleCreate(ref, build);
  }
}
