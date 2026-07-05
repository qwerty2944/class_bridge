import 'dart:ui_web' as ui_web;

import 'package:flutter/material.dart';
import 'package:web/web.dart' as web;

/// Flutter 웹 전용 — Next.js `/embed/character` 페이지를 iframe 으로 임베드해
/// Unity WebGL 캐릭터를 그대로 렌더링한다.
class UnityEmbedView extends StatefulWidget {
  const UnityEmbedView({super.key, required this.embedUrl});

  final String embedUrl;

  @override
  State<UnityEmbedView> createState() => _UnityEmbedViewState();
}

class _UnityEmbedViewState extends State<UnityEmbedView> {
  late final String _viewType;

  @override
  void initState() {
    super.initState();
    _viewType = 'unity-embed-${widget.embedUrl.hashCode}-$hashCode';
    ui_web.platformViewRegistry.registerViewFactory(_viewType, (int _) {
      final iframe = web.HTMLIFrameElement()
        ..src = widget.embedUrl
        ..style.border = 'none'
        ..style.width = '100%'
        ..style.height = '100%';
      return iframe;
    });
  }

  @override
  Widget build(BuildContext context) {
    return HtmlElementView(viewType: _viewType);
  }
}
