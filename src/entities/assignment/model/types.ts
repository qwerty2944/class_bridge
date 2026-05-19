import type {
  Assignment,
  AssignmentSubmission,
  Organization,
  Profile,
  Subject,
} from '@/shared/types/database';

export type { Assignment, AssignmentSubmission, SubmissionStatus } from '@/shared/types/database';
export type AssignmentWithSubject = Assignment & { subject: Subject | null };
export type AssignmentWithRefs = Assignment & {
  subject: Subject | null;
  organization: Organization | null;
};
export type SubmissionWithStudent = AssignmentSubmission & { student: Profile };
