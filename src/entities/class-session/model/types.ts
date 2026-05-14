import type { Attendance, ClassSession, Profile, Subject } from '@/shared/types/database';

export type { ClassSession, Attendance, AttendanceStatus } from '@/shared/types/database';
export type SessionWithRefs = ClassSession & { subject: Subject | null; teacher: Profile | null };
export type AttendanceWithStudent = Attendance & { student: Profile };
