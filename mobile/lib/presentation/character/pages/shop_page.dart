import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../../../data/reward/repositories/shop_repository_impl.dart';
import '../../../domain/reward/entities/shop_item.dart';
import '../../shared/widgets/cb_card.dart';
import '../../shared/widgets/cb_empty.dart';
import '../../theme/app_colors.dart';
import '../controllers/character_controllers.dart';

/// 상점 — 코인으로 아이템 구매. 구매 즉시 인벤토리에 들어간다.
class ShopPage extends ConsumerWidget {
  const ShopPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final itemsQ = ref.watch(shopItemsProvider);
    final character = ref.watch(myCharacterProvider).asData?.value;
    final inventory = ref.watch(myInventoryProvider).asData?.value ?? [];
    final ownedIds = {for (final r in inventory) r.item.id};

    return Scaffold(
      appBar: AppBar(
        title: const Text('상점'),
        actions: [
          if (character != null)
            Padding(
              padding: EdgeInsets.only(right: 16.w),
              child: Center(
                child: Row(
                  children: [
                    Icon(Icons.monetization_on_outlined,
                        size: 18, color: Colors.amber.shade700),
                    SizedBox(width: 4.w),
                    Text('${character.coins}',
                        style: TextStyle(
                            fontSize: 14.sp, fontWeight: FontWeight.w700)),
                  ],
                ),
              ),
            ),
        ],
      ),
      body: itemsQ.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => const CbEmpty(message: '상점을 불러오지 못했습니다.'),
        data: (items) {
          if (items.isEmpty) return const CbEmpty(message: '판매 중인 아이템이 없습니다.');
          return ListView.separated(
            padding: EdgeInsets.all(16.w),
            itemCount: items.length,
            separatorBuilder: (_, i) => SizedBox(height: 8.h),
            itemBuilder: (context, i) => _ShopTile(
              item: items[i],
              owned: ownedIds.contains(items[i].id),
              coins: character?.coins ?? 0,
              level: character?.level ?? 1,
              characterId: character?.id,
            ),
          );
        },
      ),
    );
  }
}

class _ShopTile extends ConsumerStatefulWidget {
  const _ShopTile({
    required this.item,
    required this.owned,
    required this.coins,
    required this.level,
    required this.characterId,
  });

  final ShopItem item;
  final bool owned;
  final num coins;
  final int level;
  final String? characterId;

  @override
  ConsumerState<_ShopTile> createState() => _ShopTileState();
}

class _ShopTileState extends ConsumerState<_ShopTile> {
  bool _buying = false;

  Future<void> _buy() async {
    final characterId = widget.characterId;
    if (characterId == null) return;
    setState(() => _buying = true);
    try {
      await ref.read(shopRepositoryProvider).purchase(
            characterId: characterId,
            itemId: widget.item.id,
            price: widget.item.price,
            coins: widget.coins,
          );
      ref.invalidate(myCharacterProvider);
      ref.invalidate(myInventoryProvider);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('${widget.item.name} 구매 완료!')),
        );
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('구매에 실패했습니다')),
        );
      }
    } finally {
      if (mounted) setState(() => _buying = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final item = widget.item;
    final lowLevel = widget.level < item.minLevel;
    final cantAfford = widget.coins < item.price;
    final disabled = widget.owned || lowLevel || cantAfford || _buying;

    return CbCard(
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(item.name,
                    style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.w600)),
                if (item.description != null)
                  Text(item.description!,
                      style: TextStyle(
                          fontSize: 12.sp, color: AppColors.mutedForeground)),
                SizedBox(height: 4.h),
                Text(
                  'Lv.${item.minLevel} 이상 · ${item.price} 코인',
                  style: TextStyle(fontSize: 11.sp, color: AppColors.mutedForeground),
                ),
              ],
            ),
          ),
          FilledButton(
            onPressed: disabled ? null : _buy,
            child: Text(
              widget.owned
                  ? '보유중'
                  : lowLevel
                      ? '레벨 부족'
                      : _buying
                          ? '구매 중...'
                          : '구매',
            ),
          ),
        ],
      ),
    );
  }
}
