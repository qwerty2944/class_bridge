// Class Bridge DB 타입 (스키마 supabase/migrations/0001_init.sql 와 1:1 매핑)
// `supabase gen types typescript`를 돌릴 수 있을 때 자동 생성으로 교체 가능.

export type Role = 'director' | 'teacher' | 'student' | 'parent';
export type OrgRole = 'teacher' | 'student';
export type MemberStatus = 'active' | 'invited' | 'left';
export type TenantType = 'academy' | 'tutor';
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';
export type SubmissionStatus = 'pending' | 'submitted' | 'graded';
export type PostCategory = 'notice' | 'free' | 'qna';
export type Relation = 'father' | 'mother' | 'guardian';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  type: TenantType;
  invite_code: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface TenantMember {
  id: string;
  tenant_id: string;
  user_id: string;
  role: Role;
  status: MemberStatus;
  joined_at: string;
}

export interface Subject {
  id: string;
  tenant_id: string;
  name: string;
  color: string | null;
  description: string | null;
  created_at: string;
}

export interface Organization {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  subject_id: string | null;
  color: string | null;
  created_by: string | null;
  created_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrgRole;
  joined_at: string;
}

export interface ParentStudentLink {
  id: string;
  tenant_id: string;
  parent_user_id: string;
  student_user_id: string;
  relation: Relation;
  created_at: string;
}

export interface ClassSession {
  id: string;
  organization_id: string;
  subject_id: string | null;
  teacher_id: string | null;
  session_date: string;
  start_time: string | null;
  end_time: string | null;
  topic: string | null;
  content_md: string | null;
  homework_md: string | null;
  created_at: string;
}

export interface Attendance {
  id: string;
  class_session_id: string;
  student_id: string;
  status: AttendanceStatus;
  check_in_at: string | null;
  note: string | null;
}

export interface Assignment {
  id: string;
  organization_id: string;
  subject_id: string | null;
  title: string;
  description_md: string | null;
  due_at: string | null;
  created_by: string | null;
  created_at: string;
}

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  submitted_at: string | null;
  content_md: string | null;
  file_url: string | null;
  score: number | null;
  feedback_md: string | null;
  status: SubmissionStatus;
}

export interface ProgressRecord {
  id: string;
  organization_id: string;
  subject_id: string | null;
  record_date: string;
  chapter: string | null;
  page_from: number | null;
  page_to: number | null;
  content_md: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Post {
  id: string;
  tenant_id: string;
  organization_id: string | null;
  author_id: string | null;
  title: string;
  content_md: string | null;
  category: PostCategory;
  pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface PostComment {
  id: string;
  post_id: string;
  author_id: string | null;
  content: string;
  created_at: string;
}

// Supabase Database 타입 (간단형) — supabase-js 제네릭에 넘기기 좋게.
export type Database = {
  public: {
    Tables: {
      tenants: { Row: Tenant; Insert: Partial<Tenant> & Pick<Tenant, 'name' | 'slug'>; Update: Partial<Tenant> };
      profiles: { Row: Profile; Insert: Partial<Profile> & Pick<Profile, 'id'>; Update: Partial<Profile> };
      tenant_members: {
        Row: TenantMember;
        Insert: Partial<TenantMember> & Pick<TenantMember, 'tenant_id' | 'user_id' | 'role'>;
        Update: Partial<TenantMember>;
      };
      subjects: { Row: Subject; Insert: Partial<Subject> & Pick<Subject, 'tenant_id' | 'name'>; Update: Partial<Subject> };
      organizations: {
        Row: Organization;
        Insert: Partial<Organization> & Pick<Organization, 'tenant_id' | 'name'>;
        Update: Partial<Organization>;
      };
      organization_members: {
        Row: OrganizationMember;
        Insert: Partial<OrganizationMember> & Pick<OrganizationMember, 'organization_id' | 'user_id' | 'role'>;
        Update: Partial<OrganizationMember>;
      };
      parent_student_links: {
        Row: ParentStudentLink;
        Insert: Partial<ParentStudentLink> & Pick<ParentStudentLink, 'tenant_id' | 'parent_user_id' | 'student_user_id'>;
        Update: Partial<ParentStudentLink>;
      };
      class_sessions: {
        Row: ClassSession;
        Insert: Partial<ClassSession> & Pick<ClassSession, 'organization_id' | 'session_date'>;
        Update: Partial<ClassSession>;
      };
      attendances: {
        Row: Attendance;
        Insert: Partial<Attendance> & Pick<Attendance, 'class_session_id' | 'student_id'>;
        Update: Partial<Attendance>;
      };
      assignments: {
        Row: Assignment;
        Insert: Partial<Assignment> & Pick<Assignment, 'organization_id' | 'title'>;
        Update: Partial<Assignment>;
      };
      assignment_submissions: {
        Row: AssignmentSubmission;
        Insert: Partial<AssignmentSubmission> & Pick<AssignmentSubmission, 'assignment_id' | 'student_id'>;
        Update: Partial<AssignmentSubmission>;
      };
      progress_records: {
        Row: ProgressRecord;
        Insert: Partial<ProgressRecord> & Pick<ProgressRecord, 'organization_id' | 'record_date'>;
        Update: Partial<ProgressRecord>;
      };
      posts: { Row: Post; Insert: Partial<Post> & Pick<Post, 'tenant_id' | 'title'>; Update: Partial<Post> };
      post_comments: {
        Row: PostComment;
        Insert: Partial<PostComment> & Pick<PostComment, 'post_id' | 'content'>;
        Update: Partial<PostComment>;
      };
    };
  };
};

// 라벨은 @/shared/config/labels 로 이전됨.

// 라벨 backward-compat re-export (점진 마이그레이션용)
export {
  ROLE_LABEL,
  ATTENDANCE_LABEL,
  SUBMISSION_LABEL,
  CATEGORY_LABEL,
} from '@/shared/config/labels';
