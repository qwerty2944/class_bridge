// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'tenant_member_dto.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$TenantMemberDto {

 String get id;@JsonKey(name: 'tenant_id') String get tenantId;@JsonKey(name: 'user_id') String get userId; String get role; String get status; TenantDto? get tenant;
/// Create a copy of TenantMemberDto
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$TenantMemberDtoCopyWith<TenantMemberDto> get copyWith => _$TenantMemberDtoCopyWithImpl<TenantMemberDto>(this as TenantMemberDto, _$identity);

  /// Serializes this TenantMemberDto to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is TenantMemberDto&&(identical(other.id, id) || other.id == id)&&(identical(other.tenantId, tenantId) || other.tenantId == tenantId)&&(identical(other.userId, userId) || other.userId == userId)&&(identical(other.role, role) || other.role == role)&&(identical(other.status, status) || other.status == status)&&(identical(other.tenant, tenant) || other.tenant == tenant));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,tenantId,userId,role,status,tenant);

@override
String toString() {
  return 'TenantMemberDto(id: $id, tenantId: $tenantId, userId: $userId, role: $role, status: $status, tenant: $tenant)';
}


}

/// @nodoc
abstract mixin class $TenantMemberDtoCopyWith<$Res>  {
  factory $TenantMemberDtoCopyWith(TenantMemberDto value, $Res Function(TenantMemberDto) _then) = _$TenantMemberDtoCopyWithImpl;
@useResult
$Res call({
 String id,@JsonKey(name: 'tenant_id') String tenantId,@JsonKey(name: 'user_id') String userId, String role, String status, TenantDto? tenant
});


$TenantDtoCopyWith<$Res>? get tenant;

}
/// @nodoc
class _$TenantMemberDtoCopyWithImpl<$Res>
    implements $TenantMemberDtoCopyWith<$Res> {
  _$TenantMemberDtoCopyWithImpl(this._self, this._then);

  final TenantMemberDto _self;
  final $Res Function(TenantMemberDto) _then;

/// Create a copy of TenantMemberDto
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? tenantId = null,Object? userId = null,Object? role = null,Object? status = null,Object? tenant = freezed,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,tenantId: null == tenantId ? _self.tenantId : tenantId // ignore: cast_nullable_to_non_nullable
as String,userId: null == userId ? _self.userId : userId // ignore: cast_nullable_to_non_nullable
as String,role: null == role ? _self.role : role // ignore: cast_nullable_to_non_nullable
as String,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,tenant: freezed == tenant ? _self.tenant : tenant // ignore: cast_nullable_to_non_nullable
as TenantDto?,
  ));
}
/// Create a copy of TenantMemberDto
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$TenantDtoCopyWith<$Res>? get tenant {
    if (_self.tenant == null) {
    return null;
  }

  return $TenantDtoCopyWith<$Res>(_self.tenant!, (value) {
    return _then(_self.copyWith(tenant: value));
  });
}
}


/// Adds pattern-matching-related methods to [TenantMemberDto].
extension TenantMemberDtoPatterns on TenantMemberDto {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _TenantMemberDto value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _TenantMemberDto() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _TenantMemberDto value)  $default,){
final _that = this;
switch (_that) {
case _TenantMemberDto():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _TenantMemberDto value)?  $default,){
final _that = this;
switch (_that) {
case _TenantMemberDto() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id, @JsonKey(name: 'tenant_id')  String tenantId, @JsonKey(name: 'user_id')  String userId,  String role,  String status,  TenantDto? tenant)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _TenantMemberDto() when $default != null:
return $default(_that.id,_that.tenantId,_that.userId,_that.role,_that.status,_that.tenant);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id, @JsonKey(name: 'tenant_id')  String tenantId, @JsonKey(name: 'user_id')  String userId,  String role,  String status,  TenantDto? tenant)  $default,) {final _that = this;
switch (_that) {
case _TenantMemberDto():
return $default(_that.id,_that.tenantId,_that.userId,_that.role,_that.status,_that.tenant);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id, @JsonKey(name: 'tenant_id')  String tenantId, @JsonKey(name: 'user_id')  String userId,  String role,  String status,  TenantDto? tenant)?  $default,) {final _that = this;
switch (_that) {
case _TenantMemberDto() when $default != null:
return $default(_that.id,_that.tenantId,_that.userId,_that.role,_that.status,_that.tenant);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _TenantMemberDto implements TenantMemberDto {
  const _TenantMemberDto({required this.id, @JsonKey(name: 'tenant_id') required this.tenantId, @JsonKey(name: 'user_id') required this.userId, required this.role, required this.status, this.tenant});
  factory _TenantMemberDto.fromJson(Map<String, dynamic> json) => _$TenantMemberDtoFromJson(json);

@override final  String id;
@override@JsonKey(name: 'tenant_id') final  String tenantId;
@override@JsonKey(name: 'user_id') final  String userId;
@override final  String role;
@override final  String status;
@override final  TenantDto? tenant;

/// Create a copy of TenantMemberDto
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$TenantMemberDtoCopyWith<_TenantMemberDto> get copyWith => __$TenantMemberDtoCopyWithImpl<_TenantMemberDto>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$TenantMemberDtoToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _TenantMemberDto&&(identical(other.id, id) || other.id == id)&&(identical(other.tenantId, tenantId) || other.tenantId == tenantId)&&(identical(other.userId, userId) || other.userId == userId)&&(identical(other.role, role) || other.role == role)&&(identical(other.status, status) || other.status == status)&&(identical(other.tenant, tenant) || other.tenant == tenant));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,tenantId,userId,role,status,tenant);

@override
String toString() {
  return 'TenantMemberDto(id: $id, tenantId: $tenantId, userId: $userId, role: $role, status: $status, tenant: $tenant)';
}


}

/// @nodoc
abstract mixin class _$TenantMemberDtoCopyWith<$Res> implements $TenantMemberDtoCopyWith<$Res> {
  factory _$TenantMemberDtoCopyWith(_TenantMemberDto value, $Res Function(_TenantMemberDto) _then) = __$TenantMemberDtoCopyWithImpl;
@override @useResult
$Res call({
 String id,@JsonKey(name: 'tenant_id') String tenantId,@JsonKey(name: 'user_id') String userId, String role, String status, TenantDto? tenant
});


@override $TenantDtoCopyWith<$Res>? get tenant;

}
/// @nodoc
class __$TenantMemberDtoCopyWithImpl<$Res>
    implements _$TenantMemberDtoCopyWith<$Res> {
  __$TenantMemberDtoCopyWithImpl(this._self, this._then);

  final _TenantMemberDto _self;
  final $Res Function(_TenantMemberDto) _then;

/// Create a copy of TenantMemberDto
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? tenantId = null,Object? userId = null,Object? role = null,Object? status = null,Object? tenant = freezed,}) {
  return _then(_TenantMemberDto(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,tenantId: null == tenantId ? _self.tenantId : tenantId // ignore: cast_nullable_to_non_nullable
as String,userId: null == userId ? _self.userId : userId // ignore: cast_nullable_to_non_nullable
as String,role: null == role ? _self.role : role // ignore: cast_nullable_to_non_nullable
as String,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,tenant: freezed == tenant ? _self.tenant : tenant // ignore: cast_nullable_to_non_nullable
as TenantDto?,
  ));
}

/// Create a copy of TenantMemberDto
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$TenantDtoCopyWith<$Res>? get tenant {
    if (_self.tenant == null) {
    return null;
  }

  return $TenantDtoCopyWith<$Res>(_self.tenant!, (value) {
    return _then(_self.copyWith(tenant: value));
  });
}
}

// dart format on
