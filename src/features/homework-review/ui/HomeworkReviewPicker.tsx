'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Skeleton } from '@/shared/ui/skeleton';
import { fetchClassSessions } from '@/entities/class-session';
import {
  fetchSessionAssignment,
  fetchSessionAssignmentMap,
  setSubmissionApproved,
  setSubmissionQuality,
  type SessionAssignment,
} from '@/entities/assignment';
import { QualitySegmented } from '@/views/assignment-detail/ui/AssignmentDetailView';
import { SUBMISSION_QUALITY_LABEL, type SubmissionQuality } from '@/shared/types/database';

/**
 * 지난 수업 과제를 골라 학생별 quality/승인을 매기는 재사용 컴포넌트.
 *
 * - 수업 상세(PastHomeworkCheck) 에서: 같은 반의 다른 수업을 고르게 함 (currentSessionId 로 자기 제외).
 * - 새 수업/수업 수정 다이얼로그에서: 만들고 있는 새 수업이 점검할 과거 과제를 고르고
 *   학생별 처리를 미리 수행. 선택값은 value/onChange 로 외부에 expose.
 *
 * value/onChange 가 없으면 내부 상태로만 동작 (PastHomeworkCheck 의 가벼운 점검 흐름).
 */
export function HomeworkReviewPicker({
  orgId,
  tenantId,
  currentSessionId,
  value,
  onChange,
  emptyHint = '점검할 과거 과제가 없습니다.',
}: {
  orgId: string;
  tenantId: string;
  currentSessionId?: string;
  value?: string | null;
  onChange?: (assignmentId: string | null) => void;
  emptyHint?: string;
}) {
  const qc = useQueryClient();

  const sessionsQ = useQuery({
    queryKey: ['class-sessions', orgId],
    queryFn: () => fetchClassSessions(orgId),
  });
  const others = useMemo(
    () => (sessionsQ.data ?? []).filter((x) => x.id !== currentSessionId),
    [sessionsQ.data, currentSessionId],
  );

  // 과제가 있는 수업만 옵션 — N+1 회피용 묶음 조회.
  const mapQ = useQuery({
    queryKey: ['session-assignment-map', orgId, others.map((o) => o.id).join(',')],
    enabled: others.length > 0,
    queryFn: () => fetchSessionAssignmentMap(others.map((o) => o.id)),
  });
  const eligible = useMemo(
    () => others.filter((x) => mapQ.data && mapQ.data[x.id]),
    [others, mapQ.data],
  );

  // 부모가 value(=assignmentId) 로 제어 중이면 그 값으로, 아니면 첫 옵션 자동.
  const sessionByAssignment = useMemo(() => {
    const m: Record<string, string> = {};
    if (mapQ.data) for (const [sid, aid] of Object.entries(mapQ.data)) m[aid] = sid;
    return m;
  }, [mapQ.data]);

  const controlled = value !== undefined;
  const fallbackSessionId = eligible[0]?.id ?? '';
  const selectedSessionId = controlled
    ? value
      ? sessionByAssignment[value] ?? ''
      : ''
    : fallbackSessionId;

  const selectedAssignmentId = selectedSessionId ? mapQ.data?.[selectedSessionId] ?? null : null;
  const selectedSession = eligible.find((x) => x.id === selectedSessionId) ?? null;

  const handleSelect = (sessionId: string) => {
    const aid = mapQ.data?.[sessionId] ?? null;
    onChange?.(aid);
  };

  const hwQ = useQuery({
    queryKey: ['session-assignment', selectedSessionId],
    enabled: !!selectedSessionId,
    queryFn: () => fetchSessionAssignment(selectedSessionId),
  });

  const xpReward = hwQ.data?.xp_reward ?? 0;

  const qualityMutation = useMutation({
    mutationFn: async (args: {
      submissionId: string;
      studentId: string;
      studentFullName: string | null;
      quality: SubmissionQuality;
    }) =>
      setSubmissionQuality({
        submissionId: args.submissionId,
        tenantId,
        studentUserId: args.studentId,
        studentFullName: args.studentFullName,
        quality: args.quality,
        xpReward,
      }),
    onSuccess: (r, vars) => {
      qc.invalidateQueries({ queryKey: ['session-assignment', selectedSessionId] });
      qc.invalidateQueries({ queryKey: ['character'] });
      const label = SUBMISSION_QUALITY_LABEL[vars.quality];
      if (r && r.xpAdded !== 0) {
        toast.success(`${label} — ${r.xpAdded > 0 ? '+' : ''}${r.xpAdded} XP`);
      } else {
        toast.success(label);
      }
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const approveMutation = useMutation({
    mutationFn: async (args: {
      submissionId: string;
      studentId: string;
      studentFullName: string | null;
      approved: boolean;
      quality: SubmissionQuality;
    }) =>
      setSubmissionApproved({
        submissionId: args.submissionId,
        tenantId,
        studentUserId: args.studentId,
        studentFullName: args.studentFullName,
        approved: args.approved,
        quality: args.quality,
        xpReward,
      }),
    onSuccess: (r, vars) => {
      qc.invalidateQueries({ queryKey: ['session-assignment', selectedSessionId] });
      qc.invalidateQueries({ queryKey: ['character'] });
      if (r && r.xpAdded !== 0) {
        toast.success(
          vars.approved ? `확정 — +${r.xpAdded} XP` : `확정 해제 — ${r.xpAdded} XP`,
        );
      } else {
        toast.success(vars.approved ? '확정됨' : '확정 해제됨');
      }
    },
    onError: (e) => toast.error((e as Error).message),
  });

  if (!sessionsQ.isLoading && eligible.length === 0) {
    return <p className="py-4 text-center text-sm text-muted-foreground">{emptyHint}</p>;
  }

  return (
    <div className="space-y-3">
      <Select value={selectedSessionId} onValueChange={(v) => v && handleSelect(v)}>
        <SelectTrigger>
          <SelectValue>
            {(val) => {
              const x = eligible.find((o) => o.id === String(val ?? ''));
              return x
                ? `${new Date(x.session_date).toLocaleDateString('ko-KR')} · ${x.topic ?? '수업'}`
                : '수업 선택';
            }}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {eligible.map((x) => (
            <SelectItem key={x.id} value={x.id}>
              {new Date(x.session_date).toLocaleDateString('ko-KR')} · {x.topic ?? '수업'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedSession && hwQ.data && (
        <div className="rounded-md border bg-muted/30 p-3 text-sm">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium">{hwQ.data.title}</span>
            {hwQ.data.xp_reward > 0 && (
              <Badge variant="secondary">완료 시 +{hwQ.data.xp_reward} XP</Badge>
            )}
            {hwQ.data.due_at && (
              <span className="text-xs text-muted-foreground">
                마감: {new Date(hwQ.data.due_at).toLocaleString('ko-KR')}
              </span>
            )}
          </div>
          {hwQ.data.description_md && (
            <p className="mt-1.5 whitespace-pre-wrap text-xs text-muted-foreground">
              {hwQ.data.description_md}
            </p>
          )}
        </div>
      )}

      <div className="divide-y">
        {hwQ.isLoading ? (
          <Skeleton className="h-24" />
        ) : !hwQ.data || hwQ.data.submissions.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            {selectedAssignmentId ? '학생이 없습니다.' : '과거 수업을 선택하세요.'}
          </p>
        ) : (
          renderSubmissions(
            hwQ.data,
            (sub, q) =>
              qualityMutation.mutate({
                submissionId: sub.id,
                studentId: sub.student_id,
                studentFullName: sub.student?.full_name ?? null,
                quality: q,
              }),
            (sub, approved) =>
              approveMutation.mutate({
                submissionId: sub.id,
                studentId: sub.student_id,
                studentFullName: sub.student?.full_name ?? null,
                approved,
                quality: sub.quality,
              }),
          )
        )}
      </div>
    </div>
  );
}

function renderSubmissions(
  assignment: SessionAssignment,
  onQuality: (sub: SessionAssignment['submissions'][number], q: SubmissionQuality) => void,
  onApprove: (sub: SessionAssignment['submissions'][number], approved: boolean) => void,
) {
  return assignment.submissions.map((sub) => {
    const studentSubmitted = sub.status === 'submitted';
    const isApproved = sub.status === 'graded';
    return (
      <div key={sub.id} className="flex items-center gap-3 py-2.5 flex-wrap">
        <Avatar className="h-8 w-8">
          <AvatarFallback>{sub.student?.full_name?.slice(0, 1) ?? '?'}</AvatarFallback>
        </Avatar>
        <Link
          href={`/students/${sub.student_id}`}
          className="min-w-0 flex-1 truncate text-sm font-medium hover:underline"
        >
          {sub.student?.full_name}
        </Link>
        {studentSubmitted && (
          <Badge variant="outline" className="border-amber-400 text-amber-700">
            학생 제출
          </Badge>
        )}
        <Button
          size="sm"
          variant={isApproved ? 'default' : 'outline'}
          onClick={() => onApprove(sub, !isApproved)}
        >
          {isApproved ? '확정됨' : '승인'}
        </Button>
        <QualitySegmented value={sub.quality} onChange={(q) => onQuality(sub, q)} />
      </div>
    );
  });
}
