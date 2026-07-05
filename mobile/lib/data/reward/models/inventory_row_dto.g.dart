// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'inventory_row_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_InventoryRowDto _$InventoryRowDtoFromJson(Map<String, dynamic> json) =>
    _InventoryRowDto(
      id: json['id'] as String,
      characterId: json['character_id'] as String,
      equipped: json['equipped'] as bool? ?? false,
      item: ShopItemDto.fromJson(json['item'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$InventoryRowDtoToJson(_InventoryRowDto instance) =>
    <String, dynamic>{
      'id': instance.id,
      'character_id': instance.characterId,
      'equipped': instance.equipped,
      'item': instance.item,
    };
