import type { Organization, OrganizationMember, Profile, Subject } from '@/shared/types/database';

export type { Organization, OrganizationMember, OrgRole, TeacherRole } from '@/shared/types/database';
export type OrgWithSubject = Organization & { subject: Subject | null };
export type OrgMemberWithProfile = OrganizationMember & { profile: Profile };
