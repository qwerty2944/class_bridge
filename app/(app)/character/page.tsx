import { notFound } from 'next/navigation';
import { CharacterView } from '@/views/character';
import { getSessionContext } from '@/shared/auth/server';
import { canViewStudent } from '@/shared/auth/can-view-student';
import { createClient } from '@/shared/api/supabase/server';

export default async function Page({ searchParams }: { searchParams: Promise<{ user?: string }> }) {
  const sp = await searchParams;
  const targetUserId = sp.user ?? null;

  if (targetUserId) {
    const ctx = await getSessionContext();
    if (!ctx) notFound();
    if (ctx.userId !== targetUserId) {
      const supabase = await createClient();
      const { data: rows } = await supabase
        .from('tenant_members')
        .select('tenant_id')
        .eq('user_id', targetUserId)
        .eq('status', 'active');
      const studentTenantIds = new Set(((rows ?? []) as { tenant_id: string }[]).map((r) => r.tenant_id));
      const shared = ctx.memberships.map((m) => m.tenant_id).filter((t) => studentTenantIds.has(t));
      let allowed = false;
      for (const tenantId of shared) {
        if (await canViewStudent({ viewerId: ctx.userId, tenantId, studentId: targetUserId })) {
          allowed = true;
          break;
        }
      }
      if (!allowed) notFound();
    }
  }

  return <CharacterView targetUserId={targetUserId} />;
}
