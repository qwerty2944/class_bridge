import type { Profile, Tenant, TenantJoinRequest } from '@/shared/types/database';

export type {
  TenantJoinRequest,
  JoinRequestRole,
  JoinRequestStatus,
} from '@/shared/types/database';

// 학원장 승인 화면 — 신청자 프로필 동봉.
export type JoinRequestWithProfile = TenantJoinRequest & { requester: Profile | null };

// 신청자 본인 화면 — 학원 정보 동봉.
export type JoinRequestWithTenant = TenantJoinRequest & { tenant: Tenant | null };
