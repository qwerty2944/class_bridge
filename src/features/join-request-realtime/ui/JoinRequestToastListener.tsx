'use client';

import { useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { RealtimePostgresInsertPayload } from '@supabase/supabase-js';
import { createClient } from '@/shared/api/supabase/client';
import { useCurrentTenant } from '@/features/tenant-switch';
import type { TenantJoinRequest } from '@/shared/types/database';

/**
 * Supabase Realtime — 내가 학원장인 학원에 새 가입 요청이 들어오면 토스트를 띄운다.
 * AppShell 에 한 번 마운트되며 UI 는 렌더하지 않는다.
 */
export function JoinRequestToastListener() {
  const { memberships } = useCurrentTenant();
  const router = useRouter();
  const qc = useQueryClient();

  // 내가 director 역할인 학원 ID 목록.
  const directorTenantIds = useMemo(
    () => memberships.filter((m) => m.role === 'director').map((m) => m.tenant_id),
    [memberships],
  );

  useEffect(() => {
    if (directorTenantIds.length === 0) return;

    const supabase = createClient();
    const tenantSet = new Set(directorTenantIds);

    const channel = supabase
      .channel('join-request-toast')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'tenant_join_requests' },
        (payload: RealtimePostgresInsertPayload<TenantJoinRequest>) => {
          const row = payload.new;
          if (!tenantSet.has(row.tenant_id)) return;
          qc.invalidateQueries({ queryKey: ['join-requests', row.tenant_id] });
          toast.info('새 학원 가입 요청이 도착했습니다.', {
            action: {
              label: '확인',
              onClick: () => router.push('/members'),
            },
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [directorTenantIds, qc, router]);

  return null;
}
