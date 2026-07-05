import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';

import '../../../domain/reward/entities/inventory_row.dart';
import '../../../domain/reward/entities/student_character.dart';
import '../../../domain/reward/level.dart';
import '../../router/routes.dart';
import '../../shared/widgets/cb_card.dart';
import '../../shared/widgets/cb_empty.dart';
import '../../theme/app_colors.dart';
import '../../../data/reward/repositories/shop_repository_impl.dart';
import '../controllers/character_controllers.dart';
import '../widgets/unity_embed_view.dart';

/// 캐릭터 임베드 페이지 베이스 URL (Next.js `/embed/character`).
/// 배포 환경에 맞게 --dart-define EMBED_BASE_URL 로 오버라이드 가능.
const _embedBase = String.fromEnvironment(
  'EMBED_BASE_URL',
  defaultValue: 'https://class-bridge-gilt.vercel.app/embed/character',
);

String _buildEmbedUrl(StudentCharacter character, List<InventoryRow> inventory) {
  final payload = {
    'appearance': character.appearance ?? {},
    'colors': character.colors ?? {},
    'assetKeys': [
      for (final row in inventory)
        if (row.equipped) row.item.assetKey,
    ],
  };
  final b64 = base64Url.encode(utf8.encode(jsonEncode(payload)));
  return '$_embedBase?d=$b64';
}

/// 내 캐릭터 — 레벨/XP/코인 + Unity 미리보기(웹) + 인벤토리 장착 관리.
class CharacterPage extends ConsumerWidget {
  const CharacterPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final charQ = ref.watch(myCharacterProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('내 캐릭터'),
        actions: [
          TextButton.icon(
            onPressed: () => context.push(AppRoute.shop),
            icon: const Icon(Icons.storefront_outlined, size: 18),
            label: const Text('상점'),
          ),
        ],
      ),
      body: charQ.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => const CbEmpty(message: '캐릭터를 불러오지 못했습니다.'),
        data: (character) {
          if (character == null) {
            return const CbEmpty(message: '캐릭터가 없습니다.');
          }
          return _CharacterBody(character: character);
        },
      ),
    );
  }
}

class _CharacterBody extends ConsumerWidget {
  const _CharacterBody({required this.character});

  final StudentCharacter character;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final invQ = ref.watch(myInventoryProvider);
    final inventory = invQ.asData?.value ?? const <InventoryRow>[];

    final threshold = xpThresholdForLevel(character.level + 1);
    final prev = xpThresholdForLevel(character.level);
    final progress =
        ((character.xp - prev) / (threshold - prev)).clamp(0.0, 1.0).toDouble();

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(myCharacterProvider);
        ref.invalidate(myInventoryProvider);
      },
      child: ListView(
        padding: EdgeInsets.all(16.w),
        children: [
          // 상태 배지
          Row(
            children: [
              _StatBadge(
                icon: Icons.emoji_events_outlined,
                label: 'Lv. ${character.level}',
                color: Colors.indigo,
              ),
              SizedBox(width: 8.w),
              _StatBadge(
                icon: Icons.monetization_on_outlined,
                label: '${character.coins}',
                color: Colors.amber.shade700,
              ),
            ],
          ),
          SizedBox(height: 12.h),

          // Unity 캐릭터 (웹: iframe / 모바일: 안내)
          CbCard(
            padding: EdgeInsets.zero,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(12),
              // 세로 화각 고정 Unity 카메라에서 무기가 잘리지 않는 가로 비율
              child: AspectRatio(
                aspectRatio: 8 / 5,
                child: UnityEmbedView(
                  key: ValueKey(_buildEmbedUrl(character, inventory)),
                  embedUrl: _buildEmbedUrl(character, inventory),
                ),
              ),
            ),
          ),
          SizedBox(height: 8.h),

          // XP 진행도
          CbCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'XP ${character.xp} / $threshold',
                  style: TextStyle(fontSize: 12.sp, color: AppColors.mutedForeground),
                ),
                SizedBox(height: 6.h),
                ClipRRect(
                  borderRadius: BorderRadius.circular(999),
                  child: LinearProgressIndicator(value: progress, minHeight: 8.h),
                ),
              ],
            ),
          ),
          SizedBox(height: 16.h),

          Text('인벤토리',
              style: TextStyle(fontSize: 15.sp, fontWeight: FontWeight.w700)),
          SizedBox(height: 8.h),
          if (invQ.isLoading)
            const Center(child: Padding(
              padding: EdgeInsets.all(24),
              child: CircularProgressIndicator(),
            ))
          else if (inventory.isEmpty)
            const CbEmpty(message: '보유 아이템이 없습니다. 상점에서 구매해 보세요.')
          else
            for (final row in inventory) _InventoryTile(row: row),
        ],
      ),
    );
  }
}

class _InventoryTile extends ConsumerWidget {
  const _InventoryTile({required this.row});

  final InventoryRow row;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Padding(
      padding: EdgeInsets.only(bottom: 8.h),
      child: CbCard(
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(row.item.name,
                      style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.w600)),
                  if (row.item.description != null)
                    Text(row.item.description!,
                        style: TextStyle(
                            fontSize: 12.sp, color: AppColors.mutedForeground)),
                ],
              ),
            ),
            FilledButton.tonal(
              onPressed: () => _toggleEquip(ref, row),
              child: Text(row.equipped ? '해제' : '장착'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _toggleEquip(WidgetRef ref, InventoryRow row) async {
    final repo = ref.read(shopRepositoryProvider);
    if (row.equipped) {
      await repo.setEquipped(row.id, false);
    } else {
      await repo.equipExclusive(
        characterId: row.characterId,
        inventoryId: row.id,
        category: row.item.category,
      );
    }
    ref.invalidate(myInventoryProvider);
  }
}

class _StatBadge extends StatelessWidget {
  const _StatBadge({required this.icon, required this.label, required this.color});

  final IconData icon;
  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 6.h),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: color),
          SizedBox(width: 4.w),
          Text(label,
              style: TextStyle(
                  fontSize: 13.sp, fontWeight: FontWeight.w700, color: color)),
        ],
      ),
    );
  }
}
