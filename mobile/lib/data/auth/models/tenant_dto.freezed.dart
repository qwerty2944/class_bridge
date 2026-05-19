// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'tenant_dto.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$TenantDto {

 String get id; String get name; String get slug; String get type;
/// Create a copy of TenantDto
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$TenantDtoCopyWith<TenantDto> get copyWith => _$TenantDtoCopyWithImpl<TenantDto>(this as TenantDto, _$identity);

  /// Serializes this TenantDto to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is TenantDto&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.slug, slug) || other.slug == slug)&&(identical(other.type, type) || other.type == type));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,name,slug,type);

@override
String toString() {
  return 'TenantDto(id: $id, name: $name, slug: $slug, type: $type)';
}


}

/// @nodoc
abstract mixin class $TenantDtoCopyWith<$Res>  {
  factory $TenantDtoCopyWith(TenantDto value, $Res Function(TenantDto) _then) = _$TenantDtoCopyWithImpl;
@useResult
$Res call({
 String id, String name, String slug, String type
});




}
/// @nodoc
class _$TenantDtoCopyWithImpl<$Res>
    implements $TenantDtoCopyWith<$Res> {
  _$TenantDtoCopyWithImpl(this._self, this._then);

  final TenantDto _self;
  final $Res Function(TenantDto) _then;

/// Create a copy of TenantDto
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? name = null,Object? slug = null,Object? type = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,slug: null == slug ? _self.slug : slug // ignore: cast_nullable_to_non_nullable
as String,type: null == type ? _self.type : type // ignore: cast_nullable_to_non_nullable
as String,
  ));
}

}


/// Adds pattern-matching-related methods to [TenantDto].
extension TenantDtoPatterns on TenantDto {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _TenantDto value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _TenantDto() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _TenantDto value)  $default,){
final _that = this;
switch (_that) {
case _TenantDto():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _TenantDto value)?  $default,){
final _that = this;
switch (_that) {
case _TenantDto() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String name,  String slug,  String type)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _TenantDto() when $default != null:
return $default(_that.id,_that.name,_that.slug,_that.type);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String name,  String slug,  String type)  $default,) {final _that = this;
switch (_that) {
case _TenantDto():
return $default(_that.id,_that.name,_that.slug,_that.type);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String name,  String slug,  String type)?  $default,) {final _that = this;
switch (_that) {
case _TenantDto() when $default != null:
return $default(_that.id,_that.name,_that.slug,_that.type);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _TenantDto extends TenantDto {
  const _TenantDto({required this.id, required this.name, required this.slug, required this.type}): super._();
  factory _TenantDto.fromJson(Map<String, dynamic> json) => _$TenantDtoFromJson(json);

@override final  String id;
@override final  String name;
@override final  String slug;
@override final  String type;

/// Create a copy of TenantDto
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$TenantDtoCopyWith<_TenantDto> get copyWith => __$TenantDtoCopyWithImpl<_TenantDto>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$TenantDtoToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _TenantDto&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.slug, slug) || other.slug == slug)&&(identical(other.type, type) || other.type == type));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,name,slug,type);

@override
String toString() {
  return 'TenantDto(id: $id, name: $name, slug: $slug, type: $type)';
}


}

/// @nodoc
abstract mixin class _$TenantDtoCopyWith<$Res> implements $TenantDtoCopyWith<$Res> {
  factory _$TenantDtoCopyWith(_TenantDto value, $Res Function(_TenantDto) _then) = __$TenantDtoCopyWithImpl;
@override @useResult
$Res call({
 String id, String name, String slug, String type
});




}
/// @nodoc
class __$TenantDtoCopyWithImpl<$Res>
    implements _$TenantDtoCopyWith<$Res> {
  __$TenantDtoCopyWithImpl(this._self, this._then);

  final _TenantDto _self;
  final $Res Function(_TenantDto) _then;

/// Create a copy of TenantDto
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? name = null,Object? slug = null,Object? type = null,}) {
  return _then(_TenantDto(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,slug: null == slug ? _self.slug : slug // ignore: cast_nullable_to_non_nullable
as String,type: null == type ? _self.type : type // ignore: cast_nullable_to_non_nullable
as String,
  ));
}


}

// dart format on
