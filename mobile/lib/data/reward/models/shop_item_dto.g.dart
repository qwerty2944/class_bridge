// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'shop_item_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_ShopItemDto _$ShopItemDtoFromJson(Map<String, dynamic> json) => _ShopItemDto(
  id: json['id'] as String,
  tenantId: json['tenant_id'] as String,
  name: json['name'] as String,
  description: json['description'] as String?,
  category: json['category'] as String,
  assetKey: json['asset_key'] as String,
  price: (json['price'] as num).toInt(),
  minLevel: (json['min_level'] as num?)?.toInt() ?? 1,
);

Map<String, dynamic> _$ShopItemDtoToJson(_ShopItemDto instance) =>
    <String, dynamic>{
      'id': instance.id,
      'tenant_id': instance.tenantId,
      'name': instance.name,
      'description': instance.description,
      'category': instance.category,
      'asset_key': instance.assetKey,
      'price': instance.price,
      'min_level': instance.minLevel,
    };
