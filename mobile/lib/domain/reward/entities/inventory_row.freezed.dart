// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'inventory_row.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$InventoryRow {

 String get id; String get characterId; bool get equipped; ShopItem get item;
/// Create a copy of InventoryRow
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$InventoryRowCopyWith<InventoryRow> get copyWith => _$InventoryRowCopyWithImpl<InventoryRow>(this as InventoryRow, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is InventoryRow&&(identical(other.id, id) || other.id == id)&&(identical(other.characterId, characterId) || other.characterId == characterId)&&(identical(other.equipped, equipped) || other.equipped == equipped)&&(identical(other.item, item) || other.item == item));
}


@override
int get hashCode => Object.hash(runtimeType,id,characterId,equipped,item);

@override
String toString() {
  return 'InventoryRow(id: $id, characterId: $characterId, equipped: $equipped, item: $item)';
}


}

/// @nodoc
abstract mixin class $InventoryRowCopyWith<$Res>  {
  factory $InventoryRowCopyWith(InventoryRow value, $Res Function(InventoryRow) _then) = _$InventoryRowCopyWithImpl;
@useResult
$Res call({
 String id, String characterId, bool equipped, ShopItem item
});


$ShopItemCopyWith<$Res> get item;

}
/// @nodoc
class _$InventoryRowCopyWithImpl<$Res>
    implements $InventoryRowCopyWith<$Res> {
  _$InventoryRowCopyWithImpl(this._self, this._then);

  final InventoryRow _self;
  final $Res Function(InventoryRow) _then;

/// Create a copy of InventoryRow
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? characterId = null,Object? equipped = null,Object? item = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,characterId: null == characterId ? _self.characterId : characterId // ignore: cast_nullable_to_non_nullable
as String,equipped: null == equipped ? _self.equipped : equipped // ignore: cast_nullable_to_non_nullable
as bool,item: null == item ? _self.item : item // ignore: cast_nullable_to_non_nullable
as ShopItem,
  ));
}
/// Create a copy of InventoryRow
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$ShopItemCopyWith<$Res> get item {
  
  return $ShopItemCopyWith<$Res>(_self.item, (value) {
    return _then(_self.copyWith(item: value));
  });
}
}


/// Adds pattern-matching-related methods to [InventoryRow].
extension InventoryRowPatterns on InventoryRow {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _InventoryRow value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _InventoryRow() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _InventoryRow value)  $default,){
final _that = this;
switch (_that) {
case _InventoryRow():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _InventoryRow value)?  $default,){
final _that = this;
switch (_that) {
case _InventoryRow() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String characterId,  bool equipped,  ShopItem item)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _InventoryRow() when $default != null:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String characterId,  bool equipped,  ShopItem item)  $default,) {final _that = this;
switch (_that) {
case _InventoryRow():
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String characterId,  bool equipped,  ShopItem item)?  $default,) {final _that = this;
switch (_that) {
case _InventoryRow() when $default != null:
return $default(_that.id,_that.characterId,_that.equipped,_that.item);case _:
  return null;

}
}

}

/// @nodoc


class _InventoryRow implements InventoryRow {
  const _InventoryRow({required this.id, required this.characterId, required this.equipped, required this.item});
  

@override final  String id;
@override final  String characterId;
@override final  bool equipped;
@override final  ShopItem item;

/// Create a copy of InventoryRow
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$InventoryRowCopyWith<_InventoryRow> get copyWith => __$InventoryRowCopyWithImpl<_InventoryRow>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _InventoryRow&&(identical(other.id, id) || other.id == id)&&(identical(other.characterId, characterId) || other.characterId == characterId)&&(identical(other.equipped, equipped) || other.equipped == equipped)&&(identical(other.item, item) || other.item == item));
}


@override
int get hashCode => Object.hash(runtimeType,id,characterId,equipped,item);

@override
String toString() {
  return 'InventoryRow(id: $id, characterId: $characterId, equipped: $equipped, item: $item)';
}


}

/// @nodoc
abstract mixin class _$InventoryRowCopyWith<$Res> implements $InventoryRowCopyWith<$Res> {
  factory _$InventoryRowCopyWith(_InventoryRow value, $Res Function(_InventoryRow) _then) = __$InventoryRowCopyWithImpl;
@override @useResult
$Res call({
 String id, String characterId, bool equipped, ShopItem item
});


@override $ShopItemCopyWith<$Res> get item;

}
/// @nodoc
class __$InventoryRowCopyWithImpl<$Res>
    implements _$InventoryRowCopyWith<$Res> {
  __$InventoryRowCopyWithImpl(this._self, this._then);

  final _InventoryRow _self;
  final $Res Function(_InventoryRow) _then;

/// Create a copy of InventoryRow
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? characterId = null,Object? equipped = null,Object? item = null,}) {
  return _then(_InventoryRow(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,characterId: null == characterId ? _self.characterId : characterId // ignore: cast_nullable_to_non_nullable
as String,equipped: null == equipped ? _self.equipped : equipped // ignore: cast_nullable_to_non_nullable
as bool,item: null == item ? _self.item : item // ignore: cast_nullable_to_non_nullable
as ShopItem,
  ));
}

/// Create a copy of InventoryRow
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$ShopItemCopyWith<$Res> get item {
  
  return $ShopItemCopyWith<$Res>(_self.item, (value) {
    return _then(_self.copyWith(item: value));
  });
}
}

// dart format on
