import { createClient } from '@/shared/api/supabase/server';
import type { Role } from '@/shared/types/database';

interface Args {
  viewerId: string;
  tenantId: string;
  studentId: string;
}

// 서버에서 호출. RLS 가 꺼져있어 코드 레벨 가드로 동작.
// director / teacher: 같은 학원이면 OK
// student: 본인만 OK
// parent: parent_student_links 에 묶여있을 때만 OK
export async function canViewStudent({ viewerId, tenantId, studentId }: Args): Promise<boolean> {
  const supabase = await createClient();

  if (viewerId === studentId) return true;

  const { data: roleRows } = await supabase
    .from('tenant_members')
    .select('role')
    .eq('tenant_id', tenantId)
    .eq('user_id', viewerId)
    .eq('status', 'active');
  const roles = ((roleRows ?? []) as { role: Role }[]).map((r) => r.role);

  if (roles.includes('director') || roles.includes('teacher')) {
    const { count } = await supabase
      .from('tenant_members')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('user_id', studentId)
      .eq('status', 'active');
    return (count ?? 0) > 0;
  }

  if (roles.includes('parent')) {
    const { count } = await supabase
      .from('parent_student_links')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('parent_user_id', viewerId)
      .eq('student_user_id', studentId);
    return (count ?? 0) > 0;
  }

  return false;
}
