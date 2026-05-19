'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { RealtimePostgresInsertPayload } from '@supabase/supabase-js';
import { createClient } from '@/shared/api/supabase/client';
import { useCurrentTenant } from '@/features/tenant-switch';
import type { Assignment } from '@/shared/types/database';

/**
 * Supabase Realtime 구독 — 학생이 속한 반에 새 과제가 등록되면 토스트를 띄운다.
 * AppShell 에 한 번 마운트되며, UI 는 렌더하지 않는다.
 */
export function AssignmentToastListener() {
  const { userId, has } = useCurrentTenant();
  const router = useRouter();
  const isStudent = has('student');

  // 현재 사용자가 학생으로 속한 반 ID 목록.
  const orgIdsQ = useQuery({
    queryKey: ['my-student-org-ids', userId],
    enabled: isStudent && !!userId,
    queryFn: async () => {
      const { data, error } = await createClient()
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', userId!)
        .eq('role', 'student');
      if (error) throw error;
      return (data as { organization_id: string }[]).map((r) => r.organization_id);
    },
  });

  const orgIds = orgIdsQ.data;

  useEffect(() => {
    if (!isStudent || !orgIds || orgIds.length === 0) return;

    const supabase = createClient();
    const orgSet = new Set(orgIds);

    const channel = supabase
      .channel('assignment-toast')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'assignments' },
        (payload: RealtimePostgresInsertPayload<Assignment>) => {
          const row = payload.new;
          if (!orgSet.has(row.organization_id)) return;
          toast.info(`새 과제가 등록되었습니다: ${row.title}`, {
            description: row.due_at
              ? `마감 ${new Date(row.due_at).toLocaleDateString('ko-KR')}`
              : undefined,
            action: {
              label: '보기',
              onClick: () => router.push('/assignments'),
            },
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isStudent, orgIds, router]);

  return null;
}
