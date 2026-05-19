// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'dio_provider.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning
/// PostgREST 호출용 Dio. 베이스 URL + 인증 인터셉터 장착.

@ProviderFor(dio)
final dioProvider = DioProvider._();

/// PostgREST 호출용 Dio. 베이스 URL + 인증 인터셉터 장착.

final class DioProvider extends $FunctionalProvider<Dio, Dio, Dio>
    with $Provider<Dio> {
  /// PostgREST 호출용 Dio. 베이스 URL + 인증 인터셉터 장착.
  DioProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'dioProvider',
        isAutoDispose: false,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$dioHash();

  @$internal
  @override
  $ProviderElement<Dio> $createElement($ProviderPointer pointer) =>
      $ProviderElement(pointer);

  @override
  Dio create(Ref ref) {
    return dio(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(Dio value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<Dio>(value),
    );
  }
}

String _$dioHash() => r'b905394f2d61b05d610c727e946cfcfd69b266f1';

/// Retrofit 클라이언트 — 도메인 데이터 CRUD 진입점.

@ProviderFor(supabaseRestClient)
final supabaseRestClientProvider = SupabaseRestClientProvider._();

/// Retrofit 클라이언트 — 도메인 데이터 CRUD 진입점.

final class SupabaseRestClientProvider
    extends
        $FunctionalProvider<
          SupabaseRestClient,
          SupabaseRestClient,
          SupabaseRestClient
        >
    with $Provider<SupabaseRestClient> {
  /// Retrofit 클라이언트 — 도메인 데이터 CRUD 진입점.
  SupabaseRestClientProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'supabaseRestClientProvider',
        isAutoDispose: false,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$supabaseRestClientHash();

  @$internal
  @override
  $ProviderElement<SupabaseRestClient> $createElement(
    $ProviderPointer pointer,
  ) => $ProviderElement(pointer);

  @override
  SupabaseRestClient create(Ref ref) {
    return supabaseRestClient(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(SupabaseRestClient value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<SupabaseRestClient>(value),
    );
  }
}

String _$supabaseRestClientHash() =>
    r'037c3117e9923640e9eb7815945680c67477404d';
