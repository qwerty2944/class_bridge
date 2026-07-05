// 플랫폼 분기 — 웹은 iframe(HtmlElementView), 모바일은 안내 플레이스홀더.
export 'unity_embed_view_stub.dart' if (dart.library.js_interop) 'unity_embed_view_web.dart';
