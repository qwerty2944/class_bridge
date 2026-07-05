// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'shop_item.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$ShopItem {

 String get id; String get tenantId; String get name; String? get description; String get category; String get assetKey; int get price; int get minLevel;
/// Create a copy of ShopItem
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$ShopItemCopyWith<ShopItem> get copyWith => _$ShopItemCopyWithImpl<ShopItem>(this as ShopItem, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is ShopItem&&(identical(other.id, id) || other.id == id)&&(identical(other.tenantId, tenantId) || other.tenantId == tenantId)&&(identical(other.name, name) || other.name == name)&&(identical(other.description, description) || other.description == description)&&(identical(other.category, category) || other.category == category)&&(identical(other.assetKey, assetKey) || other.assetKey == assetKey)&&(identical(other.price, price) || other.price == price)&&(identical(other.minLevel, minLevel) || other.minLevel == minLevel));
}


@override
int get hashCode => Object.hash(runtimeType,id,tenantId,name,description,category,assetKey,price,minLevel);

@override
String toString() {
  return 'ShopItem(id: $id, tenantId: $tenantId, name: $name, description: $description, category: $category, assetKey: $assetKey, price: $price, minLevel: $minLevel)';
}


}

/// @nodoc
abstract mixin class $ShopItemCopyWith<$Res>  {
  factory $ShopItemCopyWith(ShopItem value, $Res Function(ShopItem) _then) = _$ShopItemCopyWithImpl;
@useResult
$Res call({
 String id, String tenantId, String name, String? description, String category, String assetKey, int price, int minLevel
});




}
/// @nodoc
class _$ShopItemCopyWithImpl<$Res>
    implements $ShopItemCopyWith<$Res> {
  _$ShopItemCopyWithImpl(this._self, this._then);

  final ShopItem _self;
  final $Res Function(ShopItem) _then;

/// Create a copy of ShopItem
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


/// Adds pattern-matching-related methods to [ShopItem].
extension ShopItemPatterns on ShopItem {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _ShopItem value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _ShopItem() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _ShopItem value)  $default,){
final _that = this;
switch (_that) {
case _ShopItem():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _ShopItem value)?  $default,){
final _that = this;
switch (_that) {
case _ShopItem() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String tenantId,  String name,  String? description,  String category,  String assetKey,  int price,  int minLevel)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _ShopItem() when $default != null:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String tenantId,  String name,  String? description,  String category,  String assetKey,  int price,  int minLevel)  $default,) {final _that = this;
switch (_that) {
case _ShopItem():
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String tenantId,  String name,  String? description,  String category,  String assetKey,  int price,  int minLevel)?  $default,) {final _that = this;
switch (_that) {
case _ShopItem() when $default != null:
return $default(_that.id,_that.tenantId,_that.name,_that.description,_that.category,_that.assetKey,_that.price,_that.minLevel);case _:
  return null;

}
}

}

/// @nodoc


class _ShopItem implements ShopItem {
  const _ShopItem({required this.id, required this.tenantId, required this.name, this.description, required this.category, required this.assetKey, required this.price, this.minLevel = 1});
  

@override final  String id;
@override final  String tenantId;
@override final  String name;
@override final  String? description;
@override final  String category;
@override final  String assetKey;
@override final  int price;
@override@JsonKey() final  int minLevel;

/// Create a copy of ShopItem
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$ShopItemCopyWith<_ShopItem> get copyWith => __$ShopItemCopyWithImpl<_ShopItem>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _ShopItem&&(identical(other.id, id) || other.id == id)&&(identical(other.tenantId, tenantId) || other.tenantId == tenantId)&&(identical(other.name, name) || other.name == name)&&(identical(other.description, description) || other.description == description)&&(identical(other.category, category) || other.category == category)&&(identical(other.assetKey, assetKey) || other.assetKey == assetKey)&&(identical(other.price, price) || other.price == price)&&(identical(other.minLevel, minLevel) || other.minLevel == minLevel));
}


@override
int get hashCode => Object.hash(runtimeType,id,tenantId,name,description,category,assetKey,price,minLevel);

@override
String toString() {
  return 'ShopItem(id: $id, tenantId: $tenantId, name: $name, description: $description, category: $category, assetKey: $assetKey, price: $price, minLevel: $minLevel)';
}


}

/// @nodoc
abstract mixin class _$ShopItemCopyWith<$Res> implements $ShopItemCopyWith<$Res> {
  factory _$ShopItemCopyWith(_ShopItem value, $Res Function(_ShopItem) _then) = __$ShopItemCopyWithImpl;
@override @useResult
$Res call({
 String id, String tenantId, String name, String? description, String category, String assetKey, int price, int minLevel
});




}
/// @nodoc
class __$ShopItemCopyWithImpl<$Res>
    implements _$ShopItemCopyWith<$Res> {
  __$ShopItemCopyWithImpl(this._self, this._then);

  final _ShopItem _self;
  final $Res Function(_ShopItem) _then;

/// Create a copy of ShopItem
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? tenantId = null,Object? name = null,Object? description = freezed,Object? category = null,Object? assetKey = null,Object? price = null,Object? minLevel = null,}) {
  return _then(_ShopItem(
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
