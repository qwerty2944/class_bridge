import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../domain/auth/entities/app_user.dart';
import '../../../domain/core/failure.dart';
import '../../auth/controllers/auth_controller.dart';

/// 로그인 후 진입점. 역할에 따라 분기될 자리.
class HomeShell extends ConsumerWidget {
  const HomeShell({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authControllerProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Class Bridge'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: '로그아웃',
            onPressed: () =>
                ref.read(authControllerProvider.notifier).signOut(),
          ),
        ],
      ),
      body: authState.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(
          child: Text(error is Failure ? error.message : '오류가 발생했습니다.'),
        ),
        data: (user) => user == null
            ? const Center(child: Text('로그인이 필요합니다.'))
            : _HomeContent(user: user),
      ),
    );
  }
}

class _HomeContent extends StatelessWidget {
  const _HomeContent({required this.user});

  final AppUser user;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('${user.displayName} 님', style: textTheme.headlineSmall),
          const SizedBox(height: 4),
          Text(user.email, style: textTheme.bodySmall),
          const SizedBox(height: 24),
          Text('역할', style: textTheme.titleSmall),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            children: user.roles.isEmpty
                ? const [Chip(label: Text('역할 없음'))]
                : user.roles
                    .map((r) => Chip(label: Text(r.label)))
                    .toList(),
          ),
          const SizedBox(height: 24),
          Text('소속 학원', style: textTheme.titleSmall),
          const SizedBox(height: 8),
          if (user.tenants.isEmpty)
            const Text('소속된 학원이 없습니다.')
          else
            ...user.tenants.map(
              (t) => ListTile(
                contentPadding: EdgeInsets.zero,
                leading: const Icon(Icons.school_outlined),
                title: Text(t.name),
                subtitle: Text(t.type),
              ),
            ),
          const Spacer(),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Text(
                user.isStaff
                    ? '관리자(원장·선생님) 기능이 이 자리에 들어갑니다.'
                    : '학생·학부모 기능(캐릭터·출결·과제)이 이 자리에 들어갑니다.',
                style: textTheme.bodyMedium,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
