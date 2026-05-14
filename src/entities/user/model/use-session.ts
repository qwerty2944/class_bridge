'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/shared/api/supabase/client';
import type { Profile } from '@/shared/types/database';
import type { Tenant, TenantMember } from '@/entities/tenant';

export interface ClientSession {
  userId: string;
  email: string | null;
  profile: Profile | null;
  memberships: (TenantMember & { tenant: Tenant })[];
}

export function useSession() {
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }: { data: { user: { id: string; email?: string } | null } }) => {
      if (!mounted) return;
      setUserId(data.user?.id ?? null);
      setEmail(data.user?.email ?? null);
      setAuthLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange(
      (_e: string, session: { user?: { id: string; email?: string } } | null) => {
        setUserId(session?.user?.id ?? null);
        setEmail(session?.user?.email ?? null);
      },
    );
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  const profileQ = useQuery({
    queryKey: ['profile', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId!).maybeSingle();
      return (data as Profile) ?? null;
    },
  });

  const membershipsQ = useQuery({
    queryKey: ['memberships', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase
        .from('tenant_members')
        .select('*, tenant:tenants(*)')
        .eq('user_id', userId!)
        .eq('status', 'active');
      return (data ?? []) as (TenantMember & { tenant: Tenant })[];
    },
  });

  return {
    userId,
    email,
    profile: profileQ.data ?? null,
    memberships: membershipsQ.data ?? [],
    loading: authLoading || profileQ.isLoading || membershipsQ.isLoading,
  };
}
