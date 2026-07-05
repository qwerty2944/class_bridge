import '../entities/inventory_row.dart';
import '../entities/shop_item.dart';

/// 상점/인벤토리 도메인 경계 — 웹 `entities/shop-item`, `entities/character` 대응.
abstract interface class ShopRepository {
  Future<List<ShopItem>> listItems(String tenantId);

  Future<List<InventoryRow>> fetchInventory(String characterId);

  /// 코인 검증 → 인벤토리 추가 → 코인 차감.
  Future<void> purchase({
    required String characterId,
    required String itemId,
    required int price,
    required num coins,
  });

  /// 같은 카테고리 장비를 모두 해제하고 대상만 장착 (웹 equipExclusive 대응).
  Future<void> equipExclusive({
    required String characterId,
    required String inventoryId,
    required String category,
  });

  Future<void> setEquipped(String inventoryId, bool equipped);
}
