// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'inventory_row_dto.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$InventoryRowDto {

 String get id;@JsonKey(name: 'character_id') String get characterId; bool get equipped; ShopItemDto get item;
/// Create a copy of InventoryRowDto
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$InventoryRowDtoCopyWith<InventoryRowDto> get copyWith => _$InventoryRowDtoCopyWithImpl<InventoryRowDto>(this as InventoryRowDto, _$identity);

  /// Serializes this InventoryRowDto to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is InventoryRowDto&&(identical(other.id, id) || other.id == id)&&(identical(other.characterId, characterId) || other.characterId == characterId)&&(identical(other.equipped, equipped) || other.equipped == equipped)&&(identical(other.item, item) || other.item == item));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,characterId,equipped,item);

@override
String toString() {
  return 'InventoryRowDto(id: $id, characterId: $characterId, equipped: $equipped, item: $item)';
}


}

/// @nodoc
abstract mixin class $InventoryRowDtoCopyWith<$Res>  {
  factory $InventoryRowDtoCopyWith(InventoryRowDto value, $Res Function(InventoryRowDto) _then) = _$InventoryRowDtoCopyWithImpl;
@useResult
$Res call({
 String id,@JsonKey(name: 'character_id') String characterId, bool equipped, ShopItemDto item
});


$ShopItemDtoCopyWith<$Res> get item;

}
/// @nodoc
class _$InventoryRowDtoCopyWithImpl<$Res>
    implements $InventoryRowDtoCopyWith<$Res> {
  _$InventoryRowDtoCopyWithImpl(this._self, this._then);

  final InventoryRowDto _self;
  final $Res Function(InventoryRowDto) _then;

/// Create a copy of InventoryRowDto
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? characterId = null,Object? equipped = null,Object? item = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,characterId: null == characterId ? _self.characterId : characterId // ignore: cast_nullable_to_non_nullable
as String,equipped: null == equipped ? _self.equipped : equipped // ignore: cast_nullable_to_non_nullable
as bool,item: null == item ? _self.item : item // ignore: cast_nullable_to_non_nullable
as ShopItemDto,
  ));
}
/// Create a copy of InventoryRowDto
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$ShopItemDtoCopyWith<$Res> get item {
  
  return $ShopItemDtoCopyWith<$Res>(_self.item, (value) {
    return _then(_self.copyWith(item: value));
  });
}
}


/// Adds pattern-matching-related methods to [InventoryRowDto].
extension InventoryRowDtoPatterns on InventoryRowDto {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _InventoryRowDto value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _InventoryRowDto() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _InventoryRowDto value)  $default,){
final _that = this;
switch (_that) {
case _InventoryRowDto():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _InventoryRowDto value)?  $default,){
final _that = this;
switch (_that) {
case _InventoryRowDto() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id, @JsonKey(name: 'character_id')  String characterId,  bool equipped,  ShopItemDto item)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _InventoryRowDto() when $default != null:
return $default(_that.id,_that.characterId,_that.equipped,_that.item);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id, @JsonKey(name: 'character_id')  String characterId,  bool equipped,  ShopItemDto item)  $default,) {final _that = this;
switch (_that) {
case _InventoryRowDto():
return $default(_that.id,_that.characterId,_that.equipped,_that.item);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id, @JsonKey(name: 'character_id')  String characterId,  bool equipped,  ShopItemDto item)?  $default,) {final _that = this;
switch (_that) {
case _InventoryRowDto() when $default != null:
return $default(_that.id,_that.characterId,_that.equipped,_that.item);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _InventoryRowDto extends InventoryRowDto {
  const _InventoryRowDto({required this.id, @JsonKey(name: 'character_id') required this.characterId, this.equipped = false, required this.item}): super._();
  factory _InventoryRowDto.fromJson(Map<String, dynamic> json) => _$InventoryRowDtoFromJson(json);

@override final  String id;
@override@JsonKey(name: 'character_id') final  String characterId;
@override@JsonKey() final  bool equipped;
@override final  ShopItemDto item;

/// Create a copy of InventoryRowDto
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$InventoryRowDtoCopyWith<_InventoryRowDto> get copyWith => __$InventoryRowDtoCopyWithImpl<_InventoryRowDto>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$InventoryRowDtoToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _InventoryRowDto&&(identical(other.id, id) || other.id == id)&&(identical(other.characterId, characterId) || other.characterId == characterId)&&(identical(other.equipped, equipped) || other.equipped == equipped)&&(identical(other.item, item) || other.item == item));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,characterId,equipped,item);

@override
String toString() {
  return 'InventoryRowDto(id: $id, characterId: $characterId, equipped: $equipped, item: $item)';
}


}

/// @nodoc
abstract mixin class _$InventoryRowDtoCopyWith<$Res> implements $InventoryRowDtoCopyWith<$Res> {
  factory _$InventoryRowDtoCopyWith(_InventoryRowDto value, $Res Function(_InventoryRowDto) _then) = __$InventoryRowDtoCopyWithImpl;
@override @useResult
$Res call({
 String id,@JsonKey(name: 'character_id') String characterId, bool equipped, ShopItemDto item
});


@override $ShopItemDtoCopyWith<$Res> get item;

}
/// @nodoc
class __$InventoryRowDtoCopyWithImpl<$Res>
    implements _$InventoryRowDtoCopyWith<$Res> {
  __$InventoryRowDtoCopyWithImpl(this._self, this._then);

  final _InventoryRowDto _self;
  final $Res Function(_InventoryRowDto) _then;

/// Create a copy of InventoryRowDto
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? characterId = null,Object? equipped = null,Object? item = null,}) {
  return _then(_InventoryRowDto(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,characterId: null == characterId ? _self.characterId : characterId // ignore: cast_nullable_to_non_nullable
as String,equipped: null == equipped ? _self.equipped : equipped // ignore: cast_nullable_to_non_nullable
as bool,item: null == item ? _self.item : item // ignore: cast_nullable_to_non_nullable
as ShopItemDto,
  ));
}

/// Create a copy of InventoryRowDto
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$ShopItemDtoCopyWith<$Res> get item {
  
  return $ShopItemDtoCopyWith<$Res>(_self.item, (value) {
    return _then(_self.copyWith(item: value));
  });
}
}

// dart format on
