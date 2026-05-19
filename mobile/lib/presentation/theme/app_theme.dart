import 'package:flutter/material.dart';

/// 앱 테마. 웹 Class Bridge 의 브랜드 컬러(파랑)를 시드로 사용.
abstract final class AppTheme {
  static const Color _seed = Color(0xFF3B82F6);

  static ThemeData get light => ThemeData(
        useMaterial3: true,
        colorSchemeSeed: _seed,
        brightness: Brightness.light,
      );
}
