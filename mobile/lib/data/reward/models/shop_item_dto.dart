import 'package:freezed_annotation/freezed_annotation.dart';

import '../../../domain/reward/entities/shop_item.dart';

part 'shop_item_dto.freezed.dart';
part 'shop_item_dto.g.dart';

/// Supabase `shop_items` 행 DTO.
@freezed
abstract class ShopItemDto with _$ShopItemDto {
  const ShopItemDto._();

  const factory ShopItemDto({
    required String id,
    @JsonKey(name: 'tenant_id') required String tenantId,
    required String name,
    String? description,
    required String category,
    @JsonKey(name: 'asset_key') required String assetKey,
    required int price,
    @JsonKey(name: 'min_level') @Default(1) int minLevel,
  }) = _ShopItemDto;

  factory ShopItemDto.fromJson(Map<String, dynamic> json) =>
      _$ShopItemDtoFromJson(json);

  ShopItem toEntity() => ShopItem(
        id: id,
        tenantId: tenantId,
        name: name,
        description: description,
        category: category,
        assetKey: assetKey,
        price: price,
        minLevel: minLevel,
      );
}
