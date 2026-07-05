import 'package:freezed_annotation/freezed_annotation.dart';

import '../../../domain/reward/entities/student_character.dart';

part 'student_character_dto.freezed.dart';
part 'student_character_dto.g.dart';

/// Supabase `student_characters` 행 DTO.
/// appearance/colors 는 XP 지급에 불필요하므로 Map 으로만 통과시킨다.
@freezed
abstract class StudentCharacterDto with _$StudentCharacterDto {
  const StudentCharacterDto._();

  const factory StudentCharacterDto({
    required String id,
    @JsonKey(name: 'tenant_id') required String tenantId,
    @JsonKey(name: 'user_id') required String userId,
    String? name,
    @Default(1) int level,
    @Default(0) num xp,
    @Default(0) num coins,
    Map<String, dynamic>? appearance,
    Map<String, dynamic>? colors,
  }) = _StudentCharacterDto;

  factory StudentCharacterDto.fromJson(Map<String, dynamic> json) =>
      _$StudentCharacterDtoFromJson(json);

  StudentCharacter toEntity() => StudentCharacter(
        id: id,
        tenantId: tenantId,
        userId: userId,
        name: name,
        level: level,
        xp: xp,
        coins: coins,
        appearance: appearance,
        colors: colors,
      );
}
