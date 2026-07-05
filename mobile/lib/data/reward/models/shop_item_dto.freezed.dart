// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'shop_item_dto.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$ShopItemDto {

 String get id;@JsonKey(name: 'tenant_id') String get tenantId; String get name; String? get description; String get category;@JsonKey(name: 'asset_key') String get assetKey; int get price;@JsonKey(name: 'min_level') int get minLevel;
/// Create a copy of ShopItemDto
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$ShopItemDtoCopyWith<ShopItemDto> get copyWith => _$ShopItemDtoCopyWithImpl<ShopItemDto>(this as ShopItemDto, _$identity);

  /// Serializes this ShopItemDto to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is ShopItemDto&&(identical(other.id, id) || other.id == id)&&(identical(other.tenantId, tenantId) || other.tenantId == tenantId)&&(identical(other.name, name) || other.name == name)&&(identical(other.description, description) || other.description == description)&&(identical(other.category, category) || other.category == category)&&(identical(other.assetKey, assetKey) || other.assetKey == assetKey)&&(identical(other.price, price) || other.price == price)&&(identical(other.minLevel, minLevel) || other.minLevel == minLevel));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,tenantId,name,description,category,assetKey,price,minLevel);

@override
String toString() {
  return 'ShopItemDto(id: $id, tenantId: $tenantId, name: $name, description: $description, category: $category, assetKey: $assetKey, price: $price, minLevel: $minLevel)';
}


}

/// @nodoc
abstract mixin class $ShopItemDtoCopyWith<$Res>  {
  factory $ShopItemDtoCopyWith(ShopItemDto value, $Res Function(ShopItemDto) _then) = _$ShopItemDtoCopyWithImpl;
@useResult
$Res call({
 String id,@JsonKey(name: 'tenant_id') String tenantId, String name, String? description, String category,@JsonKey(name: 'asset_key') String assetKey, int price,@JsonKey(name: 'min_level') int minLevel
});




}
/// @nodoc
class _$ShopItemDtoCopyWithImpl<$Res>
    implements $ShopItemDtoCopyWith<$Res> {
  _$ShopItemDtoCopyWithImpl(this._self, this._then);

  final ShopItemDto _self;
  final $Res Function(ShopItemDto) _then;

/// Create a copy of ShopItemDto
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? tenantId = null,Object? name = null,Object? description = freezed,Object? category = null,Object? assetKey = null,Object? price = null,Object? minLevel = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,tenantId: null == tenantId ? _self.tenantId : tenantId // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,description: freezed == description ? _self.description : description // ignore: cast_nullable_to_non_nullable
as String?,category: null == category ? _self.category : category // ignore: cast_nullable_to_non_nullable
as String,assetKey: null == assetKey ? _self.assetKey : assetKey // ignore: cast_nullable_to_non_nullable
as String,price: null == price ? _self.price : price // ignore: cast_nullable_to_non_nullable
as int,minLevel: null == minLevel ? _self.minLevel : minLevel // ignore: cast_nullable_to_non_nullable
as int,
  ));
}

}


/// Adds pattern-matching-related methods to [ShopItemDto].
extension ShopItemDtoPatterns on ShopItemDto {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _ShopItemDto value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _ShopItemDto() when $default != null:
return $default(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _ShopItemDto value)  $default,){
final _that = this;
switch (_that) {
case _ShopItemDto():
return $default(_that);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _ShopItemDto value)?  $default,){
final _that = this;
switch (_that) {
case _ShopItemDto() when $default != null:
return $default(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id, @JsonKey(name: 'tenant_id')  String tenantId,  String name,  String? description,  String category, @JsonKey(name: 'asset_key')  String assetKey,  int price, @JsonKey(name: 'min_level')  int minLevel)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _ShopItemDto() when $default != null:
return $default(_that.id,_that.tenantId,_that.name,_that.description,_that.category,_that.assetKey,_that.price,_that.minLevel);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id, @JsonKey(name: 'tenant_id')  String tenantId,  String name,  String? description,  String category, @JsonKey(name: 'asset_key')  String assetKey,  int price, @JsonKey(name: 'min_level')  int minLevel)  $default,) {final _that = this;
switch (_that) {
case _ShopItemDto():
return $default(_that.id,_that.tenantId,_that.name,_that.description,_that.category,_that.assetKey,_that.price,_that.minLevel);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id, @JsonKey(name: 'tenant_id')  String tenantId,  String name,  String? description,  String category, @JsonKey(name: 'asset_key')  String assetKey,  int price, @JsonKey(name: 'min_level')  int minLevel)?  $default,) {final _that = this;
switch (_that) {
case _ShopItemDto() when $default != null:
return $default(_that.id,_that.tenantId,_that.name,_that.description,_that.category,_that.assetKey,_that.price,_that.minLevel);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _ShopItemDto extends ShopItemDto {
  const _ShopItemDto({required this.id, @JsonKey(name: 'tenant_id') required this.tenantId, required this.name, this.description, required this.category, @JsonKey(name: 'asset_key') required this.assetKey, required this.price, @JsonKey(name: 'min_level') this.minLevel = 1}): super._();
  factory _ShopItemDto.fromJson(Map<String, dynamic> json) => _$ShopItemDtoFromJson(json);

@override final  String id;
@override@JsonKey(name: 'tenant_id') final  String tenantId;
@override final  String name;
@override final  String? description;
@override final  String category;
@override@JsonKey(name: 'asset_key') final  String assetKey;
@override final  int price;
@override@JsonKey(name: 'min_level') final  int minLevel;

/// Create a copy of ShopItemDto
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$ShopItemDtoCopyWith<_ShopItemDto> get copyWith => __$ShopItemDtoCopyWithImpl<_ShopItemDto>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$ShopItemDtoToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _ShopItemDto&&(identical(other.id, id) || other.id == id)&&(identical(other.tenantId, tenantId) || other.tenantId == tenantId)&&(identical(other.name, name) || other.name == name)&&(identical(other.description, description) || other.description == description)&&(identical(other.category, category) || other.category == category)&&(identical(other.assetKey, assetKey) || other.assetKey == assetKey)&&(identical(other.price, price) || other.price == price)&&(identical(other.minLevel, minLevel) || other.minLevel == minLevel));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,tenantId,name,description,category,assetKey,price,minLevel);

@override
String toString() {
  return 'ShopItemDto(id: $id, tenantId: $tenantId, name: $name, description: $description, category: $category, assetKey: $assetKey, price: $price, minLevel: $minLevel)';
}


}

/// @nodoc
abstract mixin class _$ShopItemDtoCopyWith<$Res> implements $ShopItemDtoCopyWith<$Res> {
  factory _$ShopItemDtoCopyWith(_ShopItemDto value, $Res Function(_ShopItemDto) _then) = __$ShopItemDtoCopyWithImpl;
@override @useResult
$Res call({
 String id,@JsonKey(name: 'tenant_id') String tenantId, String name, String? description, String category,@JsonKey(name: 'asset_key') String assetKey, int price,@JsonKey(name: 'min_level') int minLevel
});




}
/// @nodoc
class __$ShopItemDtoCopyWithImpl<$Res>
    implements _$ShopItemDtoCopyWith<$Res> {
  __$ShopItemDtoCopyWithImpl(this._self, this._then);

  final _ShopItemDto _self;
  final $Res Function(_ShopItemDto) _then;

/// Create a copy of ShopItemDto
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? tenantId = null,Object? name = null,Object? description = freezed,Object? category = null,Object? assetKey = null,Object? price = null,Object? minLevel = null,}) {
  return _then(_ShopItemDto(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,tenantId: null == tenantId ? _self.tenantId : tenantId // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,description: freezed == description ? _self.description : description // ignore: cast_nullable_to_non_nullable
as String?,category: null == category ? _self.category : category // ignore: cast_nullable_to_non_nullable
as String,assetKey: null == assetKey ? _self.assetKey : assetKey // ignore: cast_nullable_to_non_nullable
as String,price: null == price ? _self.price : price // ignore: cast_nullable_to_non_nullable
as int,minLevel: null == minLevel ? _self.minLevel : minLevel // ignore: cast_nullable_to_non_nullable
as int,
  ));
}


}

// dart format on
