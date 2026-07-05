// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'character_controllers.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning
/// 현재 유저의 캐릭터 (없으면 기본 외형으로 생성).

@ProviderFor(myCharacter)
final myCharacterProvider = MyCharacterProvider._();

/// 현재 유저의 캐릭터 (없으면 기본 외형으로 생성).

final class MyCharacterProvider
    extends
        $FunctionalProvider<
          AsyncValue<StudentCharacter?>,
          StudentCharacter?,
          FutureOr<StudentCharacter?>
        >
    with
        $FutureModifier<StudentCharacter?>,
        $FutureProvider<StudentCharacter?> {
  /// 현재 유저의 캐릭터 (없으면 기본 외형으로 생성).
  MyCharacterProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'myCharacterProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$myCharacterHash();

  @$internal
  @override
  $FutureProviderElement<StudentCharacter?> $createElement(
    $ProviderPointer pointer,
  ) => $FutureProviderElement(pointer);

  @override
  FutureOr<StudentCharacter?> create(Ref ref) {
    return myCharacter(ref);
  }
}

String _$myCharacterHash() => r'befea7421d5b5330b9ef79db36d44bcb8708a2a8';

/// 보유 아이템 목록.

@ProviderFor(myInventory)
final myInventoryProvider = MyInventoryProvider._();

/// 보유 아이템 목록.

final class MyInventoryProvider
    extends
        $FunctionalProvider<
          AsyncValue<List<InventoryRow>>,
          List<InventoryRow>,
          FutureOr<List<InventoryRow>>
        >
    with
        $FutureModifier<List<InventoryRow>>,
        $FutureProvider<List<InventoryRow>> {
  /// 보유 아이템 목록.
  MyInventoryProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'myInventoryProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$myInventoryHash();

  @$internal
  @override
  $FutureProviderElement<List<InventoryRow>> $createElement(
    $ProviderPointer pointer,
  ) => $FutureProviderElement(pointer);

  @override
  FutureOr<List<InventoryRow>> create(Ref ref) {
    return myInventory(ref);
  }
}

String _$myInventoryHash() => r'f8f03cca66665031586c9cf965c180ba31105e83';

/// 테넌트 상점 아이템 목록.

@ProviderFor(shopItems)
final shopItemsProvider = ShopItemsProvider._();

/// 테넌트 상점 아이템 목록.

final class ShopItemsProvider
    extends
        $FunctionalProvider<
          AsyncValue<List<ShopItem>>,
          List<ShopItem>,
          FutureOr<List<ShopItem>>
        >
    with $FutureModifier<List<ShopItem>>, $FutureProvider<List<ShopItem>> {
  /// 테넌트 상점 아이템 목록.
  ShopItemsProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'shopItemsProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$shopItemsHash();

  @$internal
  @override
  $FutureProviderElement<List<ShopItem>> $createElement(
    $ProviderPointer pointer,
  ) => $FutureProviderElement(pointer);

  @override
  FutureOr<List<ShopItem>> create(Ref ref) {
    return shopItems(ref);
  }
}

String _$shopItemsHash() => r'791f2d5fa3f9a02a7219122f451834f5b4221f6a';
