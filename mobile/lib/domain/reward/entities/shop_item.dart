import 'package:freezed_annotation/freezed_annotation.dart';

part 'shop_item.freezed.dart';

/// 상점 아이템 — 웹 shop_items 테이블 대응.
@freezed
abstract class ShopItem with _$ShopItem {
  const factory ShopItem({
    required String id,
    required String tenantId,
    required String name,
    String? description,
    required String category,
    required String assetKey,
    required int price,
    @Default(1) int minLevel,
  }) = _ShopItem;
}
