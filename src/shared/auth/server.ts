import { redirect } from 'next/navigation';
import { cache } from 'react';
import { createClient } from '@/shared/api/supabase/server';
import type { Profile, Role, Tenant, TenantMember } from '@/shared/types/database';

export const getServerUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export async function requireUser() {
  const user = await getServerUser();
  if (!user) redirect('/login');
  return user;
}

export interface SessionContext {
  userId: string;
  profile: Profile | null;
  memberships: (TenantMember & { tenant: Tenant })[];
}

export const getSessionContext = cache(async (): Promise<SessionContext | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profile }, { data: memberships }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
    supabase
      .from('tenant_members')
      .select('*, tenant:tenants(*)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('joined_at', { ascending: true }),
  ]);

  return {
    userId: user.id,
    profile: (profile as Profile) ?? null,
    memberships: (memberships ?? []) as (TenantMember & { tenant: Tenant })[],
  };
});

export async function getRolesForTenant(userId: string, tenantId: string): Promise<Role[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('tenant_members')
    .select('role')
    .eq('user_id', userId)
    .eq('tenant_id', tenantId)
    .eq('status', 'active');
  return ((data ?? []) as { role: Role }[]).map((r) => r.role);
}
