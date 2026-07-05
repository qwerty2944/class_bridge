// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'reward_result.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$RewardResult {

 int get xpAdded; int get coinsAdded; int get oldLevel; int get newLevel; bool get leveledUp;
/// Create a copy of RewardResult
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$RewardResultCopyWith<RewardResult> get copyWith => _$RewardResultCopyWithImpl<RewardResult>(this as RewardResult, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is RewardResult&&(identical(other.xpAdded, xpAdded) || other.xpAdded == xpAdded)&&(identical(other.coinsAdded, coinsAdded) || other.coinsAdded == coinsAdded)&&(identical(other.oldLevel, oldLevel) || other.oldLevel == oldLevel)&&(identical(other.newLevel, newLevel) || other.newLevel == newLevel)&&(identical(other.leveledUp, leveledUp) || other.leveledUp == leveledUp));
}


@override
int get hashCode => Object.hash(runtimeType,xpAdded,coinsAdded,oldLevel,newLevel,leveledUp);

@override
String toString() {
  return 'RewardResult(xpAdded: $xpAdded, coinsAdded: $coinsAdded, oldLevel: $oldLevel, newLevel: $newLevel, leveledUp: $leveledUp)';
}


}

/// @nodoc
abstract mixin class $RewardResultCopyWith<$Res>  {
  factory $RewardResultCopyWith(RewardResult value, $Res Function(RewardResult) _then) = _$RewardResultCopyWithImpl;
@useResult
$Res call({
 int xpAdded, int coinsAdded, int oldLevel, int newLevel, bool leveledUp
});




}
/// @nodoc
class _$RewardResultCopyWithImpl<$Res>
    implements $RewardResultCopyWith<$Res> {
  _$RewardResultCopyWithImpl(this._self, this._then);

  final RewardResult _self;
  final $Res Function(RewardResult) _then;

/// Create a copy of RewardResult
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? xpAdded = null,Object? coinsAdded = null,Object? oldLevel = null,Object? newLevel = null,Object? leveledUp = null,}) {
  return _then(_self.copyWith(
xpAdded: null == xpAdded ? _self.xpAdded : xpAdded // ignore: cast_nullable_to_non_nullable
as int,coinsAdded: null == coinsAdded ? _self.coinsAdded : coinsAdded // ignore: cast_nullable_to_non_nullable
as int,oldLevel: null == oldLevel ? _self.oldLevel : oldLevel // ignore: cast_nullable_to_non_nullable
as int,newLevel: null == newLevel ? _self.newLevel : newLevel // ignore: cast_nullable_to_non_nullable
as int,leveledUp: null == leveledUp ? _self.leveledUp : leveledUp // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}

}


/// Adds pattern-matching-related methods to [RewardResult].
extension RewardResultPatterns on RewardResult {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _RewardResult value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _RewardResult() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _RewardResult value)  $default,){
final _that = this;
switch (_that) {
case _RewardResult():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _RewardResult value)?  $default,){
final _that = this;
switch (_that) {
case _RewardResult() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( int xpAdded,  int coinsAdded,  int oldLevel,  int newLevel,  bool leveledUp)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _RewardResult() when $default != null:
return $default(_that.xpAdded,_that.coinsAdded,_that.oldLevel,_that.newLevel,_that.leveledUp);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( int xpAdded,  int coinsAdded,  int oldLevel,  int newLevel,  bool leveledUp)  $default,) {final _that = this;
switch (_that) {
case _RewardResult():
return $default(_that.xpAdded,_that.coinsAdded,_that.oldLevel,_that.newLevel,_that.leveledUp);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( int xpAdded,  int coinsAdded,  int oldLevel,  int newLevel,  bool leveledUp)?  $default,) {final _that = this;
switch (_that) {
case _RewardResult() when $default != null:
return $default(_that.xpAdded,_that.coinsAdded,_that.oldLevel,_that.newLevel,_that.leveledUp);case _:
  return null;

}
}

}

/// @nodoc


class _RewardResult implements RewardResult {
  const _RewardResult({required this.xpAdded, required this.coinsAdded, required this.oldLevel, required this.newLevel, required this.leveledUp});
  

@override final  int xpAdded;
@override final  int coinsAdded;
@override final  int oldLevel;
@override final  int newLevel;
@override final  bool leveledUp;

/// Create a copy of RewardResult
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$RewardResultCopyWith<_RewardResult> get copyWith => __$RewardResultCopyWithImpl<_RewardResult>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _RewardResult&&(identical(other.xpAdded, xpAdded) || other.xpAdded == xpAdded)&&(identical(other.coinsAdded, coinsAdded) || other.coinsAdded == coinsAdded)&&(identical(other.oldLevel, oldLevel) || other.oldLevel == oldLevel)&&(identical(other.newLevel, newLevel) || other.newLevel == newLevel)&&(identical(other.leveledUp, leveledUp) || other.leveledUp == leveledUp));
}


@override
int get hashCode => Object.hash(runtimeType,xpAdded,coinsAdded,oldLevel,newLevel,leveledUp);

@override
String toString() {
  return 'RewardResult(xpAdded: $xpAdded, coinsAdded: $coinsAdded, oldLevel: $oldLevel, newLevel: $newLevel, leveledUp: $leveledUp)';
}


}

/// @nodoc
abstract mixin class _$RewardResultCopyWith<$Res> implements $RewardResultCopyWith<$Res> {
  factory _$RewardResultCopyWith(_RewardResult value, $Res Function(_RewardResult) _then) = __$RewardResultCopyWithImpl;
@override @useResult
$Res call({
 int xpAdded, int coinsAdded, int oldLevel, int newLevel, bool leveledUp
});




}
/// @nodoc
class __$RewardResultCopyWithImpl<$Res>
    implements _$RewardResultCopyWith<$Res> {
  __$RewardResultCopyWithImpl(this._self, this._then);

  final _RewardResult _self;
  final $Res Function(_RewardResult) _then;

/// Create a copy of RewardResult
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? xpAdded = null,Object? coinsAdded = null,Object? oldLevel = null,Object? newLevel = null,Object? leveledUp = null,}) {
  return _then(_RewardResult(
xpAdded: null == xpAdded ? _self.xpAdded : xpAdded // ignore: cast_nullable_to_non_nullable
as int,coinsAdded: null == coinsAdded ? _self.coinsAdded : coinsAdded // ignore: cast_nullable_to_non_nullable
as int,oldLevel: null == oldLevel ? _self.oldLevel : oldLevel // ignore: cast_nullable_to_non_nullable
as int,newLevel: null == newLevel ? _self.newLevel : newLevel // ignore: cast_nullable_to_non_nullable
as int,leveledUp: null == leveledUp ? _self.leveledUp : leveledUp // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}


}

// dart format on
