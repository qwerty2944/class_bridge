// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'student_character.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$StudentCharacter {

 String get id; String get tenantId; String get userId; String? get name; int get level; num get xp; num get coins; Map<String, dynamic>? get appearance; Map<String, dynamic>? get colors;
/// Create a copy of StudentCharacter
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$StudentCharacterCopyWith<StudentCharacter> get copyWith => _$StudentCharacterCopyWithImpl<StudentCharacter>(this as StudentCharacter, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is StudentCharacter&&(identical(other.id, id) || other.id == id)&&(identical(other.tenantId, tenantId) || other.tenantId == tenantId)&&(identical(other.userId, userId) || other.userId == userId)&&(identical(other.name, name) || other.name == name)&&(identical(other.level, level) || other.level == level)&&(identical(other.xp, xp) || other.xp == xp)&&(identical(other.coins, coins) || other.coins == coins)&&const DeepCollectionEquality().equals(other.appearance, appearance)&&const DeepCollectionEquality().equals(other.colors, colors));
}


@override
int get hashCode => Object.hash(runtimeType,id,tenantId,userId,name,level,xp,coins,const DeepCollectionEquality().hash(appearance),const DeepCollectionEquality().hash(colors));

@override
String toString() {
  return 'StudentCharacter(id: $id, tenantId: $tenantId, userId: $userId, name: $name, level: $level, xp: $xp, coins: $coins, appearance: $appearance, colors: $colors)';
}


}

/// @nodoc
abstract mixin class $StudentCharacterCopyWith<$Res>  {
  factory $StudentCharacterCopyWith(StudentCharacter value, $Res Function(StudentCharacter) _then) = _$StudentCharacterCopyWithImpl;
@useResult
$Res call({
 String id, String tenantId, String userId, String? name, int level, num xp, num coins, Map<String, dynamic>? appearance, Map<String, dynamic>? colors
});




}
/// @nodoc
class _$StudentCharacterCopyWithImpl<$Res>
    implements $StudentCharacterCopyWith<$Res> {
  _$StudentCharacterCopyWithImpl(this._self, this._then);

  final StudentCharacter _self;
  final $Res Function(StudentCharacter) _then;

/// Create a copy of StudentCharacter
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? tenantId = null,Object? userId = null,Object? name = freezed,Object? level = null,Object? xp = null,Object? coins = null,Object? appearance = freezed,Object? colors = freezed,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,tenantId: null == tenantId ? _self.tenantId : tenantId // ignore: cast_nullable_to_non_nullable
as String,userId: null == userId ? _self.userId : userId // ignore: cast_nullable_to_non_nullable
as String,name: freezed == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String?,level: null == level ? _self.level : level // ignore: cast_nullable_to_non_nullable
as int,xp: null == xp ? _self.xp : xp // ignore: cast_nullable_to_non_nullable
as num,coins: null == coins ? _self.coins : coins // ignore: cast_nullable_to_non_nullable
as num,appearance: freezed == appearance ? _self.appearance : appearance // ignore: cast_nullable_to_non_nullable
as Map<String, dynamic>?,colors: freezed == colors ? _self.colors : colors // ignore: cast_nullable_to_non_nullable
as Map<String, dynamic>?,
  ));
}

}


/// Adds pattern-matching-related methods to [StudentCharacter].
extension StudentCharacterPatterns on StudentCharacter {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _StudentCharacter value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _StudentCharacter() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _StudentCharacter value)  $default,){
final _that = this;
switch (_that) {
case _StudentCharacter():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _StudentCharacter value)?  $default,){
final _that = this;
switch (_that) {
case _StudentCharacter() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String tenantId,  String userId,  String? name,  int level,  num xp,  num coins,  Map<String, dynamic>? appearance,  Map<String, dynamic>? colors)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _StudentCharacter() when $default != null:
return $default(_that.id,_that.tenantId,_that.userId,_that.name,_that.level,_that.xp,_that.coins,_that.appearance,_that.colors);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String tenantId,  String userId,  String? name,  int level,  num xp,  num coins,  Map<String, dynamic>? appearance,  Map<String, dynamic>? colors)  $default,) {final _that = this;
switch (_that) {
case _StudentCharacter():
return $default(_that.id,_that.tenantId,_that.userId,_that.name,_that.level,_that.xp,_that.coins,_that.appearance,_that.colors);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String tenantId,  String userId,  String? name,  int level,  num xp,  num coins,  Map<String, dynamic>? appearance,  Map<String, dynamic>? colors)?  $default,) {final _that = this;
switch (_that) {
case _StudentCharacter() when $default != null:
return $default(_that.id,_that.tenantId,_that.userId,_that.name,_that.level,_that.xp,_that.coins,_that.appearance,_that.colors);case _:
  return null;

}
}

}

/// @nodoc


class _StudentCharacter implements StudentCharacter {
  const _StudentCharacter({required this.id, required this.tenantId, required this.userId, this.name, this.level = 1, this.xp = 0, this.coins = 0, final  Map<String, dynamic>? appearance, final  Map<String, dynamic>? colors}): _appearance = appearance,_colors = colors;
  

@override final  String id;
@override final  String tenantId;
@override final  String userId;
@override final  String? name;
@override@JsonKey() final  int level;
@override@JsonKey() final  num xp;
@override@JsonKey() final  num coins;
 final  Map<String, dynamic>? _appearance;
@override Map<String, dynamic>? get appearance {
  final value = _appearance;
  if (value == null) return null;
  if (_appearance is EqualUnmodifiableMapView) return _appearance;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableMapView(value);
}

 final  Map<String, dynamic>? _colors;
@override Map<String, dynamic>? get colors {
  final value = _colors;
  if (value == null) return null;
  if (_colors is EqualUnmodifiableMapView) return _colors;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableMapView(value);
}


/// Create a copy of StudentCharacter
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$StudentCharacterCopyWith<_StudentCharacter> get copyWith => __$StudentCharacterCopyWithImpl<_StudentCharacter>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _StudentCharacter&&(identical(other.id, id) || other.id == id)&&(identical(other.tenantId, tenantId) || other.tenantId == tenantId)&&(identical(other.userId, userId) || other.userId == userId)&&(identical(other.name, name) || other.name == name)&&(identical(other.level, level) || other.level == level)&&(identical(other.xp, xp) || other.xp == xp)&&(identical(other.coins, coins) || other.coins == coins)&&const DeepCollectionEquality().equals(other._appearance, _appearance)&&const DeepCollectionEquality().equals(other._colors, _colors));
}


@override
int get hashCode => Object.hash(runtimeType,id,tenantId,userId,name,level,xp,coins,const DeepCollectionEquality().hash(_appearance),const DeepCollectionEquality().hash(_colors));

@override
String toString() {
  return 'StudentCharacter(id: $id, tenantId: $tenantId, userId: $userId, name: $name, level: $level, xp: $xp, coins: $coins, appearance: $appearance, colors: $colors)';
}


}

/// @nodoc
abstract mixin class _$StudentCharacterCopyWith<$Res> implements $StudentCharacterCopyWith<$Res> {
  factory _$StudentCharacterCopyWith(_StudentCharacter value, $Res Function(_StudentCharacter) _then) = __$StudentCharacterCopyWithImpl;
@override @useResult
$Res call({
 String id, String tenantId, String userId, String? name, int level, num xp, num coins, Map<String, dynamic>? appearance, Map<String, dynamic>? colors
});




}
/// @nodoc
class __$StudentCharacterCopyWithImpl<$Res>
    implements _$StudentCharacterCopyWith<$Res> {
  __$StudentCharacterCopyWithImpl(this._self, this._then);

  final _StudentCharacter _self;
  final $Res Function(_StudentCharacter) _then;

/// Create a copy of StudentCharacter
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? tenantId = null,Object? userId = null,Object? name = freezed,Object? level = null,Object? xp = null,Object? coins = null,Object? appearance = freezed,Object? colors = freezed,}) {
  return _then(_StudentCharacter(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,tenantId: null == tenantId ? _self.tenantId : tenantId // ignore: cast_nullable_to_non_nullable
as String,userId: null == userId ? _self.userId : userId // ignore: cast_nullable_to_non_nullable
as String,name: freezed == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String?,level: null == level ? _self.level : level // ignore: cast_nullable_to_non_nullable
as int,xp: null == xp ? _self.xp : xp // ignore: cast_nullable_to_non_nullable
as num,coins: null == coins ? _self.coins : coins // ignore: cast_nullable_to_non_nullable
as num,appearance: freezed == appearance ? _self._appearance : appearance // ignore: cast_nullable_to_non_nullable
as Map<String, dynamic>?,colors: freezed == colors ? _self._colors : colors // ignore: cast_nullable_to_non_nullable
as Map<String, dynamic>?,
  ));
}


}

// dart format on
