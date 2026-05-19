import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

import '../../data/auth/models/profile_dto.dart';
import '../../data/auth/models/tenant_member_dto.dart';

part 'rest_client.g.dart';

/// Supabase PostgREST(`/rest/v1`) Retrofit 클라이언트.
/// 쿼리 값은 PostgREST 연산자 문법을 따른다 (예: `userId: 'eq.<uuid>'`).
@RestApi()
abstract class SupabaseRestClient {
  factory SupabaseRestClient(Dio dio, {String? baseUrl}) = _SupabaseRestClient;

  @GET('/tenant_members')
  Future<List<TenantMemberDto>> getTenantMembers({
    @Query('user_id') required String userId,
    @Query('status') required String status,
    @Query('select') String select = '*,tenant:tenants(*)',
  });

  @GET('/profiles')
  Future<List<ProfileDto>> getProfiles({
    @Query('id') required String id,
    @Query('select') String select = '*',
  });
}
