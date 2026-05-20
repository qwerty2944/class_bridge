import type {
  Attendance,
  ClassSession,
  Organization,
  Profile,
  Subject,
} from '@/shared/types/database';

export type { ClassSession, Attendance, AttendanceStatus } from '@/shared/types/database';
export type SessionWithRefs = ClassSession & { subject: Subject | null; teacher: Profile | null };
// 수업 목록(여러 반 묶음 조회) 에서 반 이름 배지를 보여주려면 organization 도 같이 받는다.
export type SessionWithOrg = SessionWithRefs & { organization: Organization | null };
export type AttendanceWithStudent = Attendance & { student: Profile };
export type AttendanceWithSession = Attendance & {
  session: (ClassSession & { subject: Subject | null }) | null;
};
