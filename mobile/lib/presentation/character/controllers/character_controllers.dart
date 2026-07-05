import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../data/reward/repositories/reward_repository_impl.dart';
import '../../../data/reward/repositories/shop_repository_impl.dart';
import '../../../domain/reward/entities/inventory_row.dart';
import '../../../domain/reward/entities/shop_item.dart';
import '../../../domain/reward/entities/student_character.dart';
import '../../tenant/controllers/current_tenant.dart';

part 'character_controllers.g.dart';

/// 현재 유저의 캐릭터 (없으면 기본 외형으로 생성).
@riverpod
Future<StudentCharacter?> myCharacter(Ref ref) async {
  final ctx = ref.watch(currentTenantProvider);
  if (ctx == null) return null;
  return ref.watch(rewardRepositoryProvider).ensureCharacter(
        tenantId: ctx.tenant.id,
        userId: ctx.userId,
        fullName: ctx.user.displayName,
      );
}

/// 보유 아이템 목록.
@riverpod
Future<List<InventoryRow>> myInventory(Ref ref) async {
  final character = await ref.watch(myCharacterProvider.future);
  if (character == null) return const [];
  return ref.watch(shopRepositoryProvider).fetchInventory(character.id);
}

/// 테넌트 상점 아이템 목록.
@riverpod
Future<List<ShopItem>> shopItems(Ref ref) async {
  final ctx = ref.watch(currentTenantProvider);
  if (ctx == null) return const [];
  return ref.watch(shopRepositoryProvider).listItems(ctx.tenant.id);
}
