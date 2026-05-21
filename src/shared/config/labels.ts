import type {
  Role,
  AttendanceStatus,
  SubmissionStatus,
  SubmissionQuality,
  PostCategory,
  HandoverScope,
  TeacherRole,
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

// 과제 점검 3단계 — '아주 잘 햇음' 은 보너스 XP 지급 (xpReward * 1.5).
export const SUBMISSION_QUALITY_LABEL: Record<SubmissionQuality, string> = {
  none: '안 햇음',
  done: '햇음',
  excellent: '아주 잘 햇음',
};

export const CATEGORY_LABEL: Record<PostCategory, string> = {
  notice: '공지',
  free: '자유',
  qna: 'Q&A',
};

export const HANDOVER_SCOPE_LABEL: Record<HandoverScope, string> = {
  organization: '반 인수인계',
  student: '학생 인수인계',
};

export const TEACHER_ROLE_LABEL: Record<TeacherRole, string> = {
  homeroom: '담임',
  assistant: '부담임',
};
