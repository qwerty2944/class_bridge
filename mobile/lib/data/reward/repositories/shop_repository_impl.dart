import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../domain/core/failure.dart';
import '../../../domain/reward/entities/inventory_row.dart';
import '../../../domain/reward/entities/shop_item.dart';
import '../../../domain/reward/repositories/shop_repository.dart';
import '../../../infrastructure/network/dio_provider.dart';
import '../../../infrastructure/network/rest_client.dart';
import '../../common/repository_guard.dart';

part 'shop_repository_impl.g.dart';

/// 웹 `src/entities/shop-item/api` + `equipExclusive` 를 이식.
class ShopRepositoryImpl implements ShopRepository {
  ShopRepositoryImpl(this._restClient);

  final SupabaseRestClient _restClient;

  @override
  Future<List<ShopItem>> listItems(String tenantId) {
    return guard(() async {
      final rows = await _restClient.getShopItems(tenantId: 'eq.$tenantId');
      return rows.map((r) => r.toEntity()).toList();
    });
  }

  @override
  Future<List<InventoryRow>> fetchInventory(String characterId) {
    return guard(() async {
      final rows = await _restClient.getInventory(characterId: 'eq.$characterId');
      return rows.map((r) => r.toEntity()).toList();
    });
  }

  @override
  Future<void> purchase({
    required String characterId,
    required String itemId,
    required int price,
    required num coins,
  }) {
    return guard(() async {
      if (coins < price) throw const Failure.server('코인이 부족합니다.');
      await _restClient.insertInventory(body: {
        'character_id': characterId,
        'shop_item_id': itemId,
      });
      await _restClient.patchCharacter(
        id: 'eq.$characterId',
        body: {'coins': coins - price},
      );
    });
  }

  @override
  Future<void> equipExclusive({
    required String characterId,
    required String inventoryId,
    required String category,
  }) {
    return guard(() async {
      // 같은 카테고리 보유분 전체 해제 후 대상만 장착
      final rows = await _restClient.getInventory(characterId: 'eq.$characterId');
      final sameCategoryIds = rows
          .where((r) => r.item.category == category && r.equipped)
          .map((r) => r.id)
          .toList();
      if (sameCategoryIds.isNotEmpty) {
        await _restClient.patchInventoryByIds(
          idIn: 'in.(${sameCategoryIds.join(',')})',
          characterId: 'eq.$characterId',
          body: {'equipped': false},
        );
      }
      await _restClient.patchInventoryById(
        id: 'eq.$inventoryId',
        body: {'equipped': true},
      );
    });
  }

  @override
  Future<void> setEquipped(String inventoryId, bool equipped) {
    return guard(() async {
      await _restClient.patchInventoryById(
        id: 'eq.$inventoryId',
        body: {'equipped': equipped},
      );
    });
  }
}

@riverpod
ShopRepository shopRepository(Ref ref) =>
    ShopRepositoryImpl(ref.watch(supabaseRestClientProvider));
