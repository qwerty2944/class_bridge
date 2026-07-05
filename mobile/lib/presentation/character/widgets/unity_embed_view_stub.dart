import 'package:flutter/material.dart';

/// 모바일(iOS/Android) 폴백 — Unity WebGL 임베드는 웹 빌드에서만 지원.
class UnityEmbedView extends StatelessWidget {
  const UnityEmbedView({super.key, required this.embedUrl});

  final String embedUrl;

  @override
  Widget build(BuildContext context) {
    return Container(
      alignment: Alignment.center,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.indigo.shade50, Colors.pink.shade50],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(12),
      ),
      child: const Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.videogame_asset_outlined, size: 48, color: Colors.indigo),
          SizedBox(height: 8),
          Text('캐릭터 미리보기는 웹에서 확인할 수 있어요', style: TextStyle(fontSize: 13)),
        ],
      ),
    );
  }
}
