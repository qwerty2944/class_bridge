import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';

import '../../auth/controllers/auth_controller.dart';
import '../../router/routes.dart';
import '../../shared/widgets/cb_avatar.dart';
import '../../shared/widgets/cb_badge.dart';
import '../../shared/widgets/cb_card.dart';
import '../../shared/widgets/cb_section_header.dart';
import '../../tenant/controllers/current_tenant.dart';
import '../../theme/app_colors.dart';
import '../../theme/labels.dart';

/// 더보기 — 프로필 요약 + 관리 메뉴(설정/반 관리/초대코드/학원 합류) + 로그아웃.
class MorePage extends ConsumerWidget {
  const MorePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final ctx = ref.watch(currentTenantProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('더보기')),
      body: ListView(
        padding: EdgeInsets.all(16.w),
        children: [
          if (ctx != null) ...[
            CbCard(
              child: Row(
                children: [
                  CbAvatar(name: ctx.user.displayName, size: 44.r),
                  SizedBox(width: 12.w),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(ctx.user.displayName,
                            style: TextStyle(
                                fontSize: 16.sp, fontWeight: FontWeight.w700)),
                        SizedBox(height: 2.h),
                        Text(ctx.user.email,
                            style: TextStyle(
                                fontSize: 12.sp,
                                color: AppColors.mutedForeground)),
                        SizedBox(height: 8.h),
                        Wrap(
                          spacing: 6.w,
                          runSpacing: 4.h,
                          children: [
                            CbBadge(
                              text:
                                  '${ctx.tenant.name} · ${Labels.tenantTypeOf(ctx.tenant.type)}',
                              tone: (
                                bg: AppColors.muted,
                                fg: AppColors.mutedForeground
                              ),
                            ),
                            for (final r in ctx.roles)
                              CbBadge.role(r.toString().split('.').last),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            SizedBox(height: 20.h),
            const CbSectionHeader(title: '캐릭터'),
            _MenuRow(
              icon: Icons.videogame_asset_outlined,
              label: '내 캐릭터',
              description: '레벨 · XP · 아이템 장착',
              onTap: () => context.push(AppRoute.character),
            ),
            SizedBox(height: 8.h),
            _MenuRow(
              icon: Icons.storefront_outlined,
              label: '상점',
              description: '코인으로 아이템 구매',
              onTap: () => context.push(AppRoute.shop),
            ),
            SizedBox(height: 20.h),
            const CbSectionHeader(title: '관리'),
            _MenuRow(
              icon: Icons.settings_outlined,
              label: '설정',
              description: '프로필 · 학원 정보',
              onTap: () => context.push(AppRoute.settings),
            ),
            SizedBox(height: 8.h),
            _MenuRow(
              icon: Icons.groups_outlined,
              label: '반 관리',
              description: '반 목록 · 멤버',
              onTap: () => context.push(AppRoute.orgs),
            ),
            if (ctx.isDirector && ctx.tenant.inviteCode != null) ...[
              SizedBox(height: 8.h),
              _MenuRow(
                icon: Icons.confirmation_number_outlined,
                label: '초대코드 복사',
                description: ctx.tenant.inviteCode!,
                onTap: () async {
                  await Clipboard.setData(
                      ClipboardData(text: ctx.tenant.inviteCode!));
                  if (context.mounted) {
                    ScaffoldMessenger.of(context)
                      ..hideCurrentSnackBar()
                      ..showSnackBar(
                          const SnackBar(content: Text('초대코드를 복사했습니다.')));
                  }
                },
              ),
            ],
            SizedBox(height: 8.h),
            _MenuRow(
              icon: Icons.add_business_outlined,
              label: '학원 추가·합류',
              description: '새 학원 만들기 / 다른 학원 합류',
              onTap: () => context.push(AppRoute.setup),
            ),
            SizedBox(height: 20.h),
          ],
          CbCard(
            onTap: () => _confirmLogout(context, ref),
            child: Row(
              children: [
                Icon(Icons.logout, size: 20.r, color: AppColors.destructive),
                SizedBox(width: 12.w),
                Text('로그아웃',
                    style: TextStyle(
                        fontSize: 14.sp,
                        fontWeight: FontWeight.w600,
                        color: AppColors.destructive)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _confirmLogout(BuildContext context, WidgetRef ref) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('로그아웃'),
        content: const Text('로그아웃 하시겠어요?'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('취소')),
          FilledButton(
              onPressed: () => Navigator.pop(context, true),
              child: const Text('로그아웃')),
        ],
      ),
    );
    if (ok == true) {
      await ref.read(authControllerProvider.notifier).signOut();
    }
  }
}

class _MenuRow extends StatelessWidget {
  const _MenuRow({
    required this.icon,
    required this.label,
    this.description,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final String? description;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return CbCard(
      padding: EdgeInsets.symmetric(horizontal: 14.w, vertical: 12.h),
      onTap: onTap,
      child: Row(
        children: [
          Icon(icon, size: 20.r, color: AppColors.foreground),
          SizedBox(width: 12.w),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label,
                    style: TextStyle(
                        fontSize: 14.sp, fontWeight: FontWeight.w600)),
                if (description != null)
                  Text(description!,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                          fontSize: 11.sp, color: AppColors.mutedForeground)),
              ],
            ),
          ),
          Icon(Icons.chevron_right,
              size: 20.r, color: AppColors.mutedForeground),
        ],
      ),
    );
  }
}
