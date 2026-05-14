import type { Assignment, AssignmentSubmission, Profile, Subject } from '@/shared/types/database';

export type { Assignment, AssignmentSubmission, SubmissionStatus } from '@/shared/types/database';
export type AssignmentWithSubject = Assignment & { subject: Subject | null };
export type SubmissionWithStudent = AssignmentSubmission & { student: Profile };
