import type { Organization, Profile, TeacherHandover } from '@/shared/types/database';

export type { TeacherHandover, HandoverScope } from '@/shared/types/database';

// 인계 목록 표시용 — 양쪽 선생님 프로필 + 반 정보를 함께 묶은 형태.
export type HandoverWithProfiles = TeacherHandover & {
  from_teacher: Profile | null;
  to_teacher: Profile | null;
  organization: Organization | null;
};
