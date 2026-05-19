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
// 수업 상세 화면에서 "출결 + 과제 점검" 을 한 번에 처리하기 위한 묶음 타입.
export type SessionAssignment = Assignment & {
  subject: Subject | null;
  submissions: SubmissionWithStudent[];
};
