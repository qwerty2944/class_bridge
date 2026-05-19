'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Skeleton } from '@/shared/ui/skeleton';
import { fetchHandoversForStudent } from '@/entities/handover';
import { HANDOVER_SCOPE_LABEL } from '@/shared/config/labels';
import { useCurrentTenant } from '@/features/tenant-switch';

// 학생 상세에 표시되는 인수인계 이력 —
// 이 학생을 직접 인계한 기록 + 학생이 속한 반의 인계 기록을 함께 보여준다.
export function HandoverHistory({ studentId, orgIds }: { studentId: string; orgIds: string[] }) {
  const { tenantId } = useCurrentTenant();

  const q = useQuery({
    queryKey: ['handovers-student', studentId, orgIds.join(',')],
    enabled: !!tenantId && !!studentId,
    queryFn: () => fetchHandoversForStudent(tenantId!, studentId, orgIds),
  });

  if (q.isLoading) return <Skeleton className="h-40" />;
  const rows = q.data ?? [];
  if (rows.length === 0)
    return (
      <Card>
        <CardContent className="p-8 text-center text-sm text-muted-foreground">
          인수인계 기록이 없습니다.
        </CardContent>
      </Card>
    );

  return (
    <div className="space-y-2">
      {rows.map((h) => (
        <Card key={h.id}>
          <CardContent className="p-3 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary">{HANDOVER_SCOPE_LABEL[h.scope]}</Badge>
              {h.organization && <Badge variant="outline">{h.organization.name}</Badge>}
              <span className="text-xs text-muted-foreground ml-auto">
                {new Date(h.created_at).toLocaleDateString('ko-KR')}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <span className="font-medium">{h.from_teacher?.full_name ?? '—'}</span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-medium">{h.to_teacher?.full_name ?? '—'}</span>
            </div>
            {h.memo ? (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap rounded-md bg-muted/40 p-2.5">
                {h.memo}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">인계 메모 없음</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
