// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'reward_event_dto.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$RewardEventDto {

 String get id;@JsonKey(name: 'character_id') String get characterId; String get source;@JsonKey(name: 'source_ref') String? get sourceRef;@JsonKey(name: 'xp_delta') num get xpDelta;@JsonKey(name: 'coin_delta') num get coinDelta; String? get note;
/// Create a copy of RewardEventDto
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$RewardEventDtoCopyWith<RewardEventDto> get copyWith => _$RewardEventDtoCopyWithImpl<RewardEventDto>(this as RewardEventDto, _$identity);

  /// Serializes this RewardEventDto to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is RewardEventDto&&(identical(other.id, id) || other.id == id)&&(identical(other.characterId, characterId) || other.characterId == characterId)&&(identical(other.source, source) || other.source == source)&&(identical(other.sourceRef, sourceRef) || other.sourceRef == sourceRef)&&(identical(other.xpDelta, xpDelta) || other.xpDelta == xpDelta)&&(identical(other.coinDelta, coinDelta) || other.coinDelta == coinDelta)&&(identical(other.note, note) || other.note == note));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,characterId,source,sourceRef,xpDelta,coinDelta,note);

@override
String toString() {
  return 'RewardEventDto(id: $id, characterId: $characterId, source: $source, sourceRef: $sourceRef, xpDelta: $xpDelta, coinDelta: $coinDelta, note: $note)';
}


}

/// @nodoc
abstract mixin class $RewardEventDtoCopyWith<$Res>  {
  factory $RewardEventDtoCopyWith(RewardEventDto value, $Res Function(RewardEventDto) _then) = _$RewardEventDtoCopyWithImpl;
@useResult
$Res call({
 String id,@JsonKey(name: 'character_id') String characterId, String source,@JsonKey(name: 'source_ref') String? sourceRef,@JsonKey(name: 'xp_delta') num xpDelta,@JsonKey(name: 'coin_delta') num coinDelta, String? note
});




}
/// @nodoc
class _$RewardEventDtoCopyWithImpl<$Res>
    implements $RewardEventDtoCopyWith<$Res> {
  _$RewardEventDtoCopyWithImpl(this._self, this._then);

  final RewardEventDto _self;
  final $Res Function(RewardEventDto) _then;

/// Create a copy of RewardEventDto
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? characterId = null,Object? source = null,Object? sourceRef = freezed,Object? xpDelta = null,Object? coinDelta = null,Object? note = freezed,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,characterId: null == characterId ? _self.characterId : characterId // ignore: cast_nullable_to_non_nullable
as String,source: null == source ? _self.source : source // ignore: cast_nullable_to_non_nullable
as String,sourceRef: freezed == sourceRef ? _self.sourceRef : sourceRef // ignore: cast_nullable_to_non_nullable
as String?,xpDelta: null == xpDelta ? _self.xpDelta : xpDelta // ignore: cast_nullable_to_non_nullable
as num,coinDelta: null == coinDelta ? _self.coinDelta : coinDelta // ignore: cast_nullable_to_non_nullable
as num,note: freezed == note ? _self.note : note // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}

}


/// Adds pattern-matching-related methods to [RewardEventDto].
extension RewardEventDtoPatterns on RewardEventDto {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _RewardEventDto value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _RewardEventDto() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _RewardEventDto value)  $default,){
final _that = this;
switch (_that) {
case _RewardEventDto():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _RewardEventDto value)?  $default,){
final _that = this;
switch (_that) {
case _RewardEventDto() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id, @JsonKey(name: 'character_id')  String characterId,  String source, @JsonKey(name: 'source_ref')  String? sourceRef, @JsonKey(name: 'xp_delta')  num xpDelta, @JsonKey(name: 'coin_delta')  num coinDelta,  String? note)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _RewardEventDto() when $default != null:
return $default(_that.id,_that.characterId,_that.source,_that.sourceRef,_that.xpDelta,_that.coinDelta,_that.note);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id, @JsonKey(name: 'character_id')  String characterId,  String source, @JsonKey(name: 'source_ref')  String? sourceRef, @JsonKey(name: 'xp_delta')  num xpDelta, @JsonKey(name: 'coin_delta')  num coinDelta,  String? note)  $default,) {final _that = this;
switch (_that) {
case _RewardEventDto():
return $default(_that.id,_that.characterId,_that.source,_that.sourceRef,_that.xpDelta,_that.coinDelta,_that.note);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id, @JsonKey(name: 'character_id')  String characterId,  String source, @JsonKey(name: 'source_ref')  String? sourceRef, @JsonKey(name: 'xp_delta')  num xpDelta, @JsonKey(name: 'coin_delta')  num coinDelta,  String? note)?  $default,) {final _that = this;
switch (_that) {
case _RewardEventDto() when $default != null:
return $default(_that.id,_that.characterId,_that.source,_that.sourceRef,_that.xpDelta,_that.coinDelta,_that.note);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _RewardEventDto implements RewardEventDto {
  const _RewardEventDto({required this.id, @JsonKey(name: 'character_id') required this.characterId, required this.source, @JsonKey(name: 'source_ref') this.sourceRef, @JsonKey(name: 'xp_delta') this.xpDelta = 0, @JsonKey(name: 'coin_delta') this.coinDelta = 0, this.note});
  factory _RewardEventDto.fromJson(Map<String, dynamic> json) => _$RewardEventDtoFromJson(json);

@override final  String id;
@override@JsonKey(name: 'character_id') final  String characterId;
@override final  String source;
@override@JsonKey(name: 'source_ref') final  String? sourceRef;
@override@JsonKey(name: 'xp_delta') final  num xpDelta;
@override@JsonKey(name: 'coin_delta') final  num coinDelta;
@override final  String? note;

/// Create a copy of RewardEventDto
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$RewardEventDtoCopyWith<_RewardEventDto> get copyWith => __$RewardEventDtoCopyWithImpl<_RewardEventDto>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$RewardEventDtoToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _RewardEventDto&&(identical(other.id, id) || other.id == id)&&(identical(other.characterId, characterId) || other.characterId == characterId)&&(identical(other.source, source) || other.source == source)&&(identical(other.sourceRef, sourceRef) || other.sourceRef == sourceRef)&&(identical(other.xpDelta, xpDelta) || other.xpDelta == xpDelta)&&(identical(other.coinDelta, coinDelta) || other.coinDelta == coinDelta)&&(identical(other.note, note) || other.note == note));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,characterId,source,sourceRef,xpDelta,coinDelta,note);

@override
String toString() {
  return 'RewardEventDto(id: $id, characterId: $characterId, source: $source, sourceRef: $sourceRef, xpDelta: $xpDelta, coinDelta: $coinDelta, note: $note)';
}


}

/// @nodoc
abstract mixin class _$RewardEventDtoCopyWith<$Res> implements $RewardEventDtoCopyWith<$Res> {
  factory _$RewardEventDtoCopyWith(_RewardEventDto value, $Res Function(_RewardEventDto) _then) = __$RewardEventDtoCopyWithImpl;
@override @useResult
$Res call({
 String id,@JsonKey(name: 'character_id') String characterId, String source,@JsonKey(name: 'source_ref') String? sourceRef,@JsonKey(name: 'xp_delta') num xpDelta,@JsonKey(name: 'coin_delta') num coinDelta, String? note
});




}
/// @nodoc
class __$RewardEventDtoCopyWithImpl<$Res>
    implements _$RewardEventDtoCopyWith<$Res> {
  __$RewardEventDtoCopyWithImpl(this._self, this._then);

  final _RewardEventDto _self;
  final $Res Function(_RewardEventDto) _then;

/// Create a copy of RewardEventDto
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? characterId = null,Object? source = null,Object? sourceRef = freezed,Object? xpDelta = null,Object? coinDelta = null,Object? note = freezed,}) {
  return _then(_RewardEventDto(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,characterId: null == characterId ? _self.characterId : characterId // ignore: cast_nullable_to_non_nullable
as String,source: null == source ? _self.source : source // ignore: cast_nullable_to_non_nullable
as String,sourceRef: freezed == sourceRef ? _self.sourceRef : sourceRef // ignore: cast_nullable_to_non_nullable
as String?,xpDelta: null == xpDelta ? _self.xpDelta : xpDelta // ignore: cast_nullable_to_non_nullable
as num,coinDelta: null == coinDelta ? _self.coinDelta : coinDelta // ignore: cast_nullable_to_non_nullable
as num,note: freezed == note ? _self.note : note // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}


}

// dart format on
