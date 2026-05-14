import type {
  Role,
  AttendanceStatus,
  SubmissionStatus,
  PostCategory,
} from '@/shared/types/database';

export const ROLE_LABEL: Record<Role, string> = {
  director: '학원장',
  teacher: '선생님',
  student: '학생',
  parent: '학부모',
};

export const ATTENDANCE_LABEL: Record<AttendanceStatus, string> = {
  present: '출석',
  absent: '결석',
  late: '지각',
  excused: '사유결석',
};

export const SUBMISSION_LABEL: Record<SubmissionStatus, string> = {
  pending: '미제출',
  submitted: '제출완료',
  graded: '채점완료',
};

export const CATEGORY_LABEL: Record<PostCategory, string> = {
  notice: '공지',
  free: '자유',
  qna: 'Q&A',
};
