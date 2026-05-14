import { notFound } from 'next/navigation';
import { getSessionContext } from '@/shared/auth/server';
import { canViewStudent } from '@/shared/auth/can-view-student';
import { createClient } from '@/shared/api/supabase/server';
import { StudentDetailView } from '@/views/student-detail';

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: studentId } = await params;
  const ctx = await getSessionContext();
  if (!ctx) notFound();

  // 학생이 속한 tenant 중 viewer 도 멤버인 곳을 찾고, 그 tenant 기준으로 권한 검증.
  const supabase = await createClient();
  const { data: studentMemberships } = await supabase
    .from('tenant_members')
    .select('tenant_id')
    .eq('user_id', studentId)
    .eq('status', 'active');
  const studentTenantIds = new Set(((studentMemberships ?? []) as { tenant_id: string }[]).map((r) => r.tenant_id));
  const viewerTenantIds = ctx.memberships.map((m) => m.tenant_id);
  const sharedTenantIds = viewerTenantIds.filter((t) => studentTenantIds.has(t));

  let allowed = false;
  for (const tenantId of sharedTenantIds) {
    if (await canViewStudent({ viewerId: ctx.userId, tenantId, studentId })) {
      allowed = true;
      break;
    }
  }
  if (!allowed) notFound();

  return <StudentDetailView studentId={studentId} />;
}
