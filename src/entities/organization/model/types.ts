import type { Organization, OrganizationMember, Profile, Subject } from '@/shared/types/database';

export type { Organization, OrganizationMember, OrgRole } from '@/shared/types/database';
export type OrgWithSubject = Organization & { subject: Subject | null };
export type OrgMemberWithProfile = OrganizationMember & { profile: Profile };
