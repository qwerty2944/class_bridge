// Class Bridge DB 타입 — 스키마 supabase/migrations/0001_init.sql + 0002_gamification.sql 와 1:1 매핑.
// MCP 자동생성판은 database.gen.ts 에 보관. 본 파일은 손글씨 + 도메인 union 타입 보존용.

import type { CharacterAppearance, CharacterColors, ShopCategory } from '@/shared/unity/types';

export type Role = 'director' | 'teacher' | 'student' | 'parent';
export type OrgRole = 'teacher' | 'student';
export type TeacherRole = 'homeroom' | 'assistant';
export type MemberStatus = 'active' | 'invited' | 'left';
export type TenantType = 'academy' | 'tutor';
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';
export type SubmissionStatus = 'pending' | 'submitted' | 'graded';
export type PostCategory = 'notice' | 'free' | 'qna';
export type Relation = 'father' | 'mother' | 'guardian';
export type RewardSource = 'assignment_grade' | 'admin' | 'level_bonus' | 'homework_check';
export type HandoverScope = 'organization' | 'student';
export type JoinRequestRole = 'teacher' | 'student' | 'parent';
export type JoinRequestStatus = 'pending' | 'approved' | 'rejected';

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
  // 선생님(role='teacher')일 때만 의미: 담임/부담임. 학생은 null.
  teacher_role: TeacherRole | null;
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
  homework_xp: number;
  share_token: string | null;
  created_at: string;
}

export interface Attendance {
  id: string;
  class_session_id: string;
  student_id: string;
  status: AttendanceStatus;
  check_in_at: string | null;
  note: string | null;
  homework_done: boolean;
}

export interface Assignment {
  id: string;
  organization_id: string;
  subject_id: string | null;
  title: string;
  description_md: string | null;
  due_at: string | null;
  xp_reward: number;
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

export interface StudentCharacter {
  id: string;
  tenant_id: string;
  user_id: string;
  name: string | null;
  level: number;
  xp: number;
  coins: number;
  appearance: CharacterAppearance;
  colors: CharacterColors;
  created_at: string;
  updated_at: string;
}

export interface ShopItem {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  category: ShopCategory;
  asset_key: string;
  payload: Record<string, unknown> | null;
  icon_url: string | null;
  price: number;
  min_level: number;
  created_at: string;
}

export interface CharacterInventoryItem {
  id: string;
  character_id: string;
  shop_item_id: string;
  equipped: boolean;
  acquired_at: string;
}

export interface RewardEvent {
  id: string;
  character_id: string;
  source: RewardSource;
  source_ref: string | null;
  xp_delta: number;
  coin_delta: number;
  note: string | null;
  created_at: string;
}

export interface TeacherHandover {
  id: string;
  tenant_id: string;
  scope: HandoverScope;
  organization_id: string | null;
  student_id: string | null;
  from_teacher_id: string | null;
  to_teacher_id: string;
  memo: string | null;
  created_by: string | null;
  created_at: string;
}

export interface TenantJoinRequest {
  id: string;
  tenant_id: string;
  user_id: string;
  requested_role: JoinRequestRole;
  status: JoinRequestStatus;
  message: string | null;
  decided_by: string | null;
  decided_at: string | null;
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
      student_characters: {
        Row: StudentCharacter;
        Insert: Partial<StudentCharacter> & Pick<StudentCharacter, 'tenant_id' | 'user_id'>;
        Update: Partial<StudentCharacter>;
      };
      shop_items: {
        Row: ShopItem;
        Insert: Partial<ShopItem> & Pick<ShopItem, 'tenant_id' | 'name' | 'category' | 'asset_key' | 'price'>;
        Update: Partial<ShopItem>;
      };
      character_inventory: {
        Row: CharacterInventoryItem;
        Insert: Partial<CharacterInventoryItem> & Pick<CharacterInventoryItem, 'character_id' | 'shop_item_id'>;
        Update: Partial<CharacterInventoryItem>;
      };
      reward_events: {
        Row: RewardEvent;
        Insert: Partial<RewardEvent> & Pick<RewardEvent, 'character_id' | 'source'>;
        Update: Partial<RewardEvent>;
      };
      teacher_handovers: {
        Row: TeacherHandover;
        Insert: Partial<TeacherHandover> & Pick<TeacherHandover, 'tenant_id' | 'scope' | 'to_teacher_id'>;
        Update: Partial<TeacherHandover>;
      };
      tenant_join_requests: {
        Row: TenantJoinRequest;
        Insert: Partial<TenantJoinRequest> &
          Pick<TenantJoinRequest, 'tenant_id' | 'user_id' | 'requested_role'>;
        Update: Partial<TenantJoinRequest>;
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
