import type { Organization, OrganizationMember, Profile, Subject } from '@/shared/types/database';

export type { Organization, OrganizationMember, OrgRole, TeacherRole } from '@/shared/types/database';

// 종합반 지원 — 반은 여러 과목을 가질 수 있다 (0021 junction).
export type OrgWithSubjects = Organization & { subjects: Subject[] };
// Backward-compat alias — 기존 코드가 OrgWithSubject 를 import 해도 그대로 동작.
export type OrgWithSubject = OrgWithSubjects;
export type OrgMemberWithProfile = OrganizationMember & { profile: Profile };
