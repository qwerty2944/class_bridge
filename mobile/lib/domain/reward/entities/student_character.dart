import 'package:freezed_annotation/freezed_annotation.dart';

part 'student_character.freezed.dart';

/// 학생 캐릭터 — XP/코인/레벨 지급에 필요한 최소 필드만 도메인으로 노출.
@freezed
abstract class StudentCharacter with _$StudentCharacter {
  const factory StudentCharacter({
    required String id,
    required String tenantId,
    required String userId,
    String? name,
    @Default(1) int level,
    @Default(0) num xp,
    @Default(0) num coins,
    Map<String, dynamic>? appearance,
    Map<String, dynamic>? colors,
  }) = _StudentCharacter;
}
