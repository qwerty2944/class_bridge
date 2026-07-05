import 'package:freezed_annotation/freezed_annotation.dart';

import '../../../domain/reward/entities/inventory_row.dart';
import 'shop_item_dto.dart';

part 'inventory_row_dto.freezed.dart';
part 'inventory_row_dto.g.dart';

/// Supabase `character_inventory` 행 DTO (`item:shop_items(*)` 조인 포함).
@freezed
abstract class InventoryRowDto with _$InventoryRowDto {
  const InventoryRowDto._();

  const factory InventoryRowDto({
    required String id,
    @JsonKey(name: 'character_id') required String characterId,
    @Default(false) bool equipped,
    required ShopItemDto item,
  }) = _InventoryRowDto;

  factory InventoryRowDto.fromJson(Map<String, dynamic> json) =>
      _$InventoryRowDtoFromJson(json);

  InventoryRow toEntity() => InventoryRow(
        id: id,
        characterId: characterId,
        equipped: equipped,
        item: item.toEntity(),
      );
}
