import 'package:flutter/material.dart';

/// 세션 복원 대기 화면. 실제 분기는 GoRouter 의 redirect 가 처리한다.
class SplashPage extends StatelessWidget {
  const SplashPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: CircularProgressIndicator()),
    );
  }
}
