import 'package:freezed_annotation/freezed_annotation.dart';

import 'shop_item.dart';

part 'inventory_row.freezed.dart';

/// 보유 아이템 — character_inventory + 조인된 shop_items.
@freezed
abstract class InventoryRow with _$InventoryRow {
  const factory InventoryRow({
    required String id,
    required String characterId,
    required bool equipped,
    required ShopItem item,
  }) = _InventoryRow;
}
