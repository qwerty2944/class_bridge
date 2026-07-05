import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

import '../../data/assignment/models/assignment_dto.dart';
import '../../data/assignment/models/submission_dto.dart';
import '../../data/auth/models/profile_dto.dart';
import '../../data/auth/models/tenant_dto.dart';
import '../../data/auth/models/tenant_member_dto.dart';
import '../../data/board/models/post_dto.dart';
import '../../data/board/models/post_comment_dto.dart';
import '../../data/class_session/models/attendance_dto.dart';
import '../../data/common/models/lite_row_dto.dart';
import '../../data/class_session/models/class_session_dto.dart';
import '../../data/organization/models/org_member_detail_dto.dart';
import '../../data/organization/models/organization_dto.dart';
import '../../data/organization/models/organization_member_dto.dart';
import '../../data/reward/models/inventory_row_dto.dart';
import '../../data/reward/models/reward_event_dto.dart';
import '../../data/reward/models/shop_item_dto.dart';
import '../../data/reward/models/student_character_dto.dart';
import '../../data/subject/models/subject_dto.dart';
import '../../data/tenant/models/join_request_dto.dart';

part 'rest_client.g.dart';

/// Supabase PostgREST(`/rest/v1`) Retrofit 클라이언트.
/// 쿼리 값은 PostgREST 연산자 문법을 따른다 (예: `userId: 'eq.<uuid>'`,
/// 다중 매칭은 `orgIds: 'in.(uuid1,uuid2)'`). 변경 요청은 `Prefer: return=representation`
/// 로 갱신된 행을 돌려받는다.
@RestApi()
abstract class SupabaseRestClient {
  factory SupabaseRestClient(Dio dio, {String? baseUrl}) = _SupabaseRestClient;

  // ===== auth / profiles =====
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

  /// 회원가입 안전망 upsert (트리거가 만든 행과 병합).
  @POST('/profiles')
  Future<void> upsertProfile({
    @Body() required Map<String, dynamic> body,
    @Header('Prefer') String prefer = 'resolution=merge-duplicates',
  });

  @PATCH('/profiles')
  Future<List<ProfileDto>> patchProfile({
    @Query('id') required String id,
    @Body() required Map<String, dynamic> body,
    @Header('Prefer') String prefer = 'return=representation',
  });

  // ===== tenants / setup =====
  @POST('/tenants')
  Future<List<TenantDto>> createTenant({
    @Body() required Map<String, dynamic> body,
    @Header('Prefer') String prefer = 'return=representation',
  });

  @PATCH('/tenants')
  Future<List<TenantDto>> patchTenant({
    @Query('id') required String id,
    @Body() required Map<String, dynamic> body,
    @Header('Prefer') String prefer = 'return=representation',
  });

  @GET('/tenants')
  Future<List<TenantDto>> getTenantByInviteCode({
    @Query('invite_code') required String inviteCode,
    @Query('select') String select = '*',
  });

  @GET('/tenants')
  Future<List<TenantDto>> searchTenants({
    @Query('name') required String name,
    @Query('select') String select = '*',
    @Query('order') String order = 'name.asc',
    @Query('limit') int limit = 10,
  });

  /// 벌크 지원 (tutor 유형은 director+teacher 2행).
  @POST('/tenant_members')
  Future<void> insertTenantMembers({
    @Body() required List<LiteRowDto> body,
  });

  /// 가입요청 가드용 활성 멤버 조회.
  @GET('/tenant_members')
  Future<List<LiteRowDto>> getTenantMemberIds({
    @Query('tenant_id') required String tenantId,
    @Query('user_id') required String userId,
    @Query('status') String status = 'eq.active',
    @Query('select') String select = 'id',
    @Query('limit') int limit = 1,
  });

  // ===== tenant_join_requests =====
  @GET('/tenant_join_requests')
  Future<List<JoinRequestDto>> getMyJoinRequests({
    @Query('user_id') required String userId,
    @Query('select') String select = '*,tenant:tenants(*)',
    @Query('order') String order = 'created_at.desc',
  });

  /// user_id/decided_by 둘 다 profiles FK 라 제약조건명으로 임베드 구분.
  @GET('/tenant_join_requests')
  Future<List<JoinRequestDto>> getPendingJoinRequests({
    @Query('tenant_id') required String tenantId,
    @Query('status') String status = 'eq.pending',
    @Query('select') String select =
        '*,requester:profiles!tenant_join_requests_user_id_fkey(*)',
    @Query('order') String order = 'created_at.asc',
  });

  @GET('/tenant_join_requests')
  Future<List<LiteRowDto>> getJoinRequestIds({
    @Query('tenant_id') required String tenantId,
    @Query('user_id') required String userId,
    @Query('status') String status = 'eq.pending',
    @Query('select') String select = 'id',
    @Query('limit') int limit = 1,
  });

  @POST('/tenant_join_requests')
  Future<List<JoinRequestDto>> createJoinRequest({
    @Body() required Map<String, dynamic> body,
    @Header('Prefer') String prefer = 'return=representation',
  });

  @PATCH('/tenant_join_requests')
  Future<void> patchJoinRequest({
    @Query('id') required String id,
    @Body() required Map<String, dynamic> body,
  });

  @DELETE('/tenant_join_requests')
  Future<void> deleteJoinRequest({
    @Query('id') required String id,
    @Query('user_id') required String userId,
    @Query('status') String status = 'eq.pending',
  });

  // ===== subjects =====
  @GET('/subjects')
  Future<List<SubjectDto>> getSubjects({
    @Query('tenant_id') required String tenantId,
    @Query('select') String select = '*',
    @Query('order') String order = 'created_at.asc',
  });

  // ===== organizations =====
  /// 테넌트 전체 조직(원장용).
  @GET('/organizations')
  Future<List<OrganizationDto>> getOrganizations({
    @Query('tenant_id') required String tenantId,
    @Query('select') String select =
        '*,organization_subjects(subject:subjects(*))',
    @Query('order') String order = 'name.asc',
  });

  /// 내가 속한 조직(학생/선생님용).
  @GET('/organization_members')
  Future<List<OrganizationMemberDto>> getMyOrganizations({
    @Query('user_id') required String userId,
    @Query('select') String select =
        'organization_id,role,organization:organizations(*,organization_subjects(subject:subjects(*)))',
  });

  @GET('/organizations')
  Future<List<OrganizationDto>> getOrganizationById({
    @Query('id') required String id,
    @Query('select') String select =
        '*,organization_subjects(subject:subjects(*))',
  });

  @POST('/organizations')
  Future<List<OrganizationDto>> createOrganization({
    @Body() required Map<String, dynamic> body,
    @Header('Prefer') String prefer = 'return=representation',
  });

  @POST('/organization_subjects')
  Future<void> insertOrganizationSubjects({
    @Body() required List<LiteRowDto> body,
  });

  /// 반 상세 멤버(프로필 조인).
  @GET('/organization_members')
  Future<List<OrgMemberDetailDto>> getOrganizationMembers({
    @Query('organization_id') required String organizationId,
    @Query('select') String select = '*,profile:profiles(*)',
    @Query('order') String order = 'joined_at.asc',
  });

  /// 수업/과제 생성 부수효과용 반 학생 user_id 목록.
  @GET('/organization_members')
  Future<List<LiteRowDto>> getOrgStudentIds({
    @Query('organization_id') required String organizationId,
    @Query('role') String role = 'eq.student',
    @Query('select') String select = 'user_id',
  });

  @PATCH('/organization_members')
  Future<void> patchOrgMember({
    @Query('id') required String id,
    @Body() required Map<String, dynamic> body,
  });

  @DELETE('/organization_members')
  Future<void> deleteOrgMember({
    @Query('id') required String id,
  });

  // ===== assignments =====
  @GET('/assignments')
  Future<List<AssignmentDto>> getAssignments({
    @Query('organization_id') required String orgIds,
    @Query('select') String select =
        '*,subject:subjects(id,name,color),organization:organizations(id,name,color)',
    @Query('order') String order = 'due_at.desc.nullslast',
  });

  @GET('/assignments')
  Future<List<AssignmentDto>> getAssignmentById({
    @Query('id') required String id,
    @Query('select') String select =
        '*,subject:subjects(id,name,color),organization:organizations(id,name,color)',
  });

  /// 이번 수업에서 나가는 과제 + 제출 임베드.
  @GET('/assignments')
  Future<List<AssignmentDto>> getSessionAssignments({
    @Query('source_session_id') required String sourceSessionId,
    @Query('select') String select =
        '*,subject:subjects(id,name,color),submissions:assignment_submissions(*,student:profiles(id,full_name,email))',
    @Query('order') String order = 'created_at.asc',
  });

  /// 과제 1건 + 전체 제출 임베드 (지난 과제 점검 카드).
  @GET('/assignments')
  Future<List<AssignmentDto>> getAssignmentWithSubmissions({
    @Query('id') required String id,
    @Query('select') String select =
        '*,subject:subjects(id,name,color),submissions:assignment_submissions(*,student:profiles(id,full_name,email))',
  });

  @POST('/assignments')
  Future<List<AssignmentDto>> createAssignment({
    @Body() required Map<String, dynamic> body,
    @Header('Prefer') String prefer = 'return=representation',
    @Query('select') String select = '*,subject:subjects(id,name,color)',
  });

  @DELETE('/assignments')
  Future<void> deleteAssignment({
    @Query('id') required String id,
  });

  // ===== assignment_submissions =====
  @GET('/assignment_submissions')
  Future<List<SubmissionDto>> getSubmissions({
    @Query('assignment_id') required String assignmentId,
    @Query('select') String select =
        '*,student:profiles(id,full_name,email)',
    @Query('order') String order = 'status.asc',
  });

  @GET('/assignment_submissions')
  Future<List<SubmissionDto>> getMySubmission({
    @Query('assignment_id') required String assignmentId,
    @Query('student_id') required String studentId,
    @Query('select') String select = '*',
  });

  /// setAssignmentStudents diff / 승인 전 상태 확인용 경량 조회.
  @GET('/assignment_submissions')
  Future<List<LiteRowDto>> getSubmissionRows({
    @Query('assignment_id') String? assignmentId,
    @Query('id') String? id,
    @Query('select') String select = 'id,student_id,status',
  });

  @POST('/assignment_submissions')
  Future<void> insertSubmissions({
    @Body() required List<LiteRowDto> body,
  });

  @DELETE('/assignment_submissions')
  Future<void> deleteSubmissions({
    @Query('assignment_id') required String assignmentId,
    @Query('student_id') required String studentIds,
  });

  @PATCH('/assignment_submissions')
  Future<List<SubmissionDto>> patchSubmission({
    @Query('id') required String id,
    @Body() required Map<String, dynamic> body,
    @Header('Prefer') String prefer = 'return=representation',
    @Query('select') String select = '*,student:profiles(id,full_name,email)',
  });

  // ===== class sessions / attendance =====
  @GET('/class_sessions')
  Future<List<ClassSessionDto>> getClassSessions({
    @Query('organization_id') required String orgIds,
    @Query('select') String select =
        '*,subject:subjects(id,name,color),teacher:profiles(id,full_name),organization:organizations(id,name,color)',
    @Query('order') String order = 'session_date.desc',
  });

  @GET('/class_sessions')
  Future<List<ClassSessionDto>> getClassSessionById({
    @Query('id') required String id,
    @Query('select') String select =
        '*,subject:subjects(id,name,color),teacher:profiles(id,full_name),organization:organizations(id,name,color)',
  });

  /// 다음 회차 계산용 최대 session_no 1행.
  @GET('/class_sessions')
  Future<List<LiteRowDto>> getMaxSessionNo({
    @Query('organization_id') required String organizationId,
    @Query('select') String select = 'session_no',
    @Query('order') String order = 'session_no.desc.nullslast',
    @Query('limit') int limit = 1,
  });

  @POST('/class_sessions')
  Future<List<ClassSessionDto>> createClassSession({
    @Body() required Map<String, dynamic> body,
    @Header('Prefer') String prefer = 'return=representation',
    @Query('select') String select =
        '*,subject:subjects(id,name,color),teacher:profiles(id,full_name)',
  });

  @GET('/attendances')
  Future<List<AttendanceDto>> getAttendances({
    @Query('class_session_id') required String classSessionId,
    @Query('select') String select = '*,student:profiles(id,full_name)',
  });

  @PATCH('/attendances')
  Future<List<AttendanceDto>> patchAttendance({
    @Query('id') required String id,
    @Body() required Map<String, dynamic> body,
    @Header('Prefer') String prefer = 'return=representation',
    @Query('select') String select = '*,student:profiles(id,full_name)',
  });

  /// 수업 생성 직후 반 학생 전원 출석 행 벌크 생성.
  @POST('/attendances')
  Future<void> insertAttendances({
    @Body() required List<LiteRowDto> body,
  });

  // ===== class_session_reviews (지난 과제 점검) =====
  @GET('/class_session_reviews')
  Future<List<LiteRowDto>> getSessionReviews({
    @Query('session_id') required String sessionId,
    @Query('select') String select = 'assignment_id',
    @Query('order') String order = 'created_at.asc',
  });

  @POST('/class_session_reviews')
  Future<void> insertSessionReview({
    @Body() required Map<String, dynamic> body,
  });

  @DELETE('/class_session_reviews')
  Future<void> deleteSessionReview({
    @Query('session_id') required String sessionId,
    @Query('assignment_id') required String assignmentId,
  });

  // ===== reward (student_characters / reward_events) =====
  @GET('/student_characters')
  Future<List<StudentCharacterDto>> getCharacter({
    @Query('tenant_id') required String tenantId,
    @Query('user_id') required String userId,
    @Query('select') String select = '*',
  });

  @POST('/student_characters')
  Future<List<StudentCharacterDto>> insertCharacter({
    @Body() required Map<String, dynamic> body,
    @Header('Prefer') String prefer = 'return=representation',
  });

  @PATCH('/student_characters')
  Future<void> patchCharacter({
    @Query('id') required String id,
    @Body() required Map<String, dynamic> body,
  });

  @GET('/reward_events')
  Future<List<RewardEventDto>> getRewardEvents({
    @Query('character_id') required String characterId,
    @Query('source') required String source,
    @Query('source_ref') required String sourceRef,
    @Query('select') String select = '*',
  });

  @POST('/reward_events')
  Future<void> insertRewardEvent({
    @Body() required Map<String, dynamic> body,
  });

  @PATCH('/reward_events')
  Future<void> patchRewardEvent({
    @Query('id') required String id,
    @Body() required Map<String, dynamic> body,
  });

  // ===== shop (shop_items / character_inventory) =====
  @GET('/shop_items')
  Future<List<ShopItemDto>> getShopItems({
    @Query('tenant_id') required String tenantId,
    @Query('select') String select = '*',
    @Query('order') String order = 'min_level.asc,price.asc',
  });

  @GET('/character_inventory')
  Future<List<InventoryRowDto>> getInventory({
    @Query('character_id') required String characterId,
    @Query('select') String select = '*,item:shop_items(*)',
  });

  @POST('/character_inventory')
  Future<void> insertInventory({
    @Body() required Map<String, dynamic> body,
  });

  @PATCH('/character_inventory')
  Future<void> patchInventoryById({
    @Query('id') required String id,
    @Body() required Map<String, dynamic> body,
  });

  @PATCH('/character_inventory')
  Future<void> patchInventoryByIds({
    @Query('id') required String idIn,
    @Query('character_id') required String characterId,
    @Body() required Map<String, dynamic> body,
  });

  // ===== board =====
  @GET('/posts')
  Future<List<PostDto>> getPosts({
    @Query('tenant_id') required String tenantId,
    @Query('select') String select = '*,author:profiles(id,full_name)',
    @Query('order') String order = 'pinned.desc,created_at.desc',
  });

  @GET('/posts')
  Future<List<PostDto>> getPostById({
    @Query('id') required String id,
    @Query('select') String select = '*,author:profiles(id,full_name)',
  });

  @POST('/posts')
  Future<List<PostDto>> createPost({
    @Body() required Map<String, dynamic> body,
    @Header('Prefer') String prefer = 'return=representation',
    @Query('select') String select = '*,author:profiles(id,full_name)',
  });

  @GET('/post_comments')
  Future<List<PostCommentDto>> getComments({
    @Query('post_id') required String postId,
    @Query('select') String select = '*,author:profiles(id,full_name)',
    @Query('order') String order = 'created_at.asc',
  });

  @POST('/post_comments')
  Future<List<PostCommentDto>> createComment({
    @Body() required Map<String, dynamic> body,
    @Header('Prefer') String prefer = 'return=representation',
    @Query('select') String select = '*,author:profiles(id,full_name)',
  });
}
